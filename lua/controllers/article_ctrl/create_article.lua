-- External modules
local ngx = require "ngx"
local cjson = require "cjson"
local db = require "lapis.db"
local utf8 = require "utf8"

-- Local modules
local PG = require "services.PG"
local each = require "util.each"
local push = require "util.push"
local fmt = string.format

local function get_user(uid)
    return PG.query([[
        select id, nickname, profile from "user" where id = ?
    ]], uid)[1]
end

local function create_article(app)
    local ctx = app.ctx

    local user = get_user(ctx.uid)

    if not user then error("user.not.exists", 0) end

    local blocks = app.params.blocks

    local a = {
        title = "",
        created_by = ctx.uid,
        author = user.nickname,
        author_profile = user.profile,
        cover = "",
        summary = "",
        content = ngx.req.get_body_data(),
        wordcount = 0,
        obj = {tags = {}, ratings_count = 0, comments_count = 0}
    }
    local sentences = {user.nickname}

    each(blocks, function(b)
        if b.type == "header" then
            if #a.title == 0 then a.title = b.data.text end
            a.wordcount = a.wordcount + utf8.len(b.data.text)
            push(sentences, b.data.text)
        elseif b.type == "paragraph" or b.type == "quote" then
            if #a.summary == 0 then a.summary = b.data.text end
            a.wordcount = a.wordcount + utf8.len(b.data.text)
            push(sentences, b.data.text)
        elseif b.type == "list" then
            each(b.data.items, function(item)
                a.wordcount = a.wordcount + utf8.len(item)
                push(sentences, item)
            end)
        elseif b.type == "image" then
            if #a.cover == 0 then
                a.cover = b.data.file.url:match("https://oss.tmspnn.com/(.*)?")
            end
        elseif b.type == "code" then
            a.wordcount = a.wordcount + utf8.len(b.data.code)
            push(sentences, b.data.code)
        end
    end)

    -- Validation
    if #a.title == 0 then
        error("title.required", 0)
    elseif a.wordcount < 50 then
        error("wordcount.too.small", 0)
    elseif a.wordcount > 1e4 then
        error("wordcount.too.big", 0)
    end

    -- Tokenization
    local tok_res = ngx.location.capture("/internal/nlp/tokenization", {
        method = ngx.HTTP_POST,
        body = cjson.encode({text = sentences})
    })

    if tok_res.status ~= 200 then error("NLP.tok." .. tok_res.status, 0) end

    local tok_fine = cjson.decode(tok_res.body)["tok/fine"]
    local tokens_hash = {}
    local tokens = {}

    -- Remove duplicated tokens
    each(tok_fine,
         function(arr) each(arr, function(txt) tokens_hash[txt] = 1 end) end)

    for t, _ in pairs(tokens_hash) do tokens[#tokens + 1] = t end

    a.obj = db.raw(fmt("'%s'::jsonb", cjson.encode(a.obj)))
    a.ts_vector = db.raw(fmt("to_tsvector('%s')", table.concat(tokens, " ")))

    local article = PG.create("article", a, "id")[1]

    ngx.timer.at(0, function(premature, uid)
        PG.query([[
            update user set articles_count = article_count + 1 where id = ?
        ]], uid)
    end, user.id)

    return {json = article}
end

return create_article
