local ngx = require "ngx"
local cjson = require "cjson"
local db = require "lapis.db"
local utf8 = require "utf8"
--
local PG = require "services.PG"
local each = require "util.each"
local fmt = string.format
local push = require "util.push"

local function get_user(uid)
    return PG.query([[
        select id, nickname, profile, followers_count from "user" where id = ?;
    ]], uid)[1]
end

local function update_articles_count(uid)
    PG.query([[
        update "user" set articles_count = articles_count + 1 where id = ?;
    ]], uid)
end

local function append_feeds(article_id, follower_ids)
    PG.query([[
        update "user" set feed_ids = array_append(feed_ids, ?) where id in ?;
    ]], article_id, db.list(follower_ids))
end

local function add_feeds(user, article_id)
    local step = 100
    local rounds = math.ceil(user.followers_count / step)

    if rounds == 1 then
        local follower_ids = PG.query([[
            select follower_ids from "user" where id = ?;
        ]], user.id)[1].follower_ids

        append_feeds(article_id, follower_ids)
    else
        for i = 1, rounds do
            local follower_ids = PG.query([[
                select follower_ids[array_upper(follower_ids, 1) - ? : ?]
                from "user" where id = ?;
            ]], i * step - 1, i == 1 and PG.MAX_INT or i * (step - 1), user.id)[1].follower_ids

            append_feeds(article_id, follower_ids)
        end
    end
end

local function on_created(premature, user, article_id, article_state)
    update_articles_count(user.id)
    if article_state == 0 then
        add_feeds(user, article_id)
    end
end

local function create_article(app)
    local ctx = app.ctx
    local user = assert(get_user(ctx.uid), "user.not.exists")
    local tags = app.params.tags or {}
    local tags_str = table.concat(tags, " ")
    local is_private = app.params.isPrivate
    local blocks = app.params.editorjs.blocks

    local a = {
        title = "",
        created_by = user.id,
        author = user.nickname,
        author_profile = user.profile,
        cover = app.params.cover or "",
        summary = "",
        content = ngx.req.get_body_data(),
        state = is_private and 1 or 0,
        wordcount = 0,
        obj = {
            tags = tags,
            ratings_count = 0,
            comments_count = 0
        }
    }
    local sentences = {tags_str, user.nickname}

    each(blocks, function(b)
        if b.type == "header" then
            if a.title == "" then
                a.title = b.data.text
            end
            a.wordcount = a.wordcount + utf8.len(b.data.text)
            push(sentences, b.data.text)
        elseif b.type == "paragraph" or b.type == "quote" then
            if a.title == "" then
                a.title = b.data.text
            end
            a.wordcount = a.wordcount + utf8.len(b.data.text)
            push(sentences, b.data.text)
        elseif b.type == "list" then
            each(b.data.items, function(item)
                a.wordcount = a.wordcount + utf8.len(item)
                push(sentences, item)
            end)
        elseif b.type == "image" then
            if a.cover == "" then
                a.cover = b.data.file.url
            end
        elseif b.type == "code" then
            a.wordcount = a.wordcount + utf8.len(b.data.code)
            push(sentences, b.data.code)
        end
    end)

    -- Validation
    if a.title == "" then
        error("title.required")
    elseif a.wordcount < 50 then
        error("wordcount.too.small")
    elseif a.wordcount > 1e4 then
        error("wordcount.too.large")
    end

    -- Tokenization
    local tok_res = ngx.location.capture("/internal/nlp/tokenization", {
        method = ngx.HTTP_POST,
        body = cjson.encode({
            text = sentences
        })
    })

    if tok_res.status ~= 200 then
        error("NLP.tok." .. tok_res.status)
    end

    local tok_fine = cjson.decode(tok_res.body)["tok/fine"]
    local tokens_hash = {}
    local tokens = {}

    -- Remove duplicated tokens
    each(tok_fine, function(arr)
        each(arr, function(txt)
            tokens_hash[txt] = 1
        end)
    end)

    for t, _ in pairs(tokens_hash) do
        tokens[#tokens + 1] = t
    end

    a.obj = db.raw(fmt("'%s'::jsonb", cjson.encode(a.obj)))
    a.ts_vector = db.raw(fmt("to_tsvector('%s')", table.concat(tokens, " ")))

    local article = PG.create("article", a, "id")[1]

    ngx.timer.at(0, on_created, user, article.id, article.state)

    return {
        json = article
    }
end

return create_article
