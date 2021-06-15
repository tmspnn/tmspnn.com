-- External modules
local cjson = require "cjson"
local db = require "lapis.db"
local json_params = require("lapis.application").json_params
local ngx = require "ngx"
local respond_to = require("lapis.application").respond_to
local utf8 = require "utf8"

-- Local modules
local Article = require "models/Article"
local empty = require "util.empty"
local push = require "util.push"
local User = require "models/User"

-- Aliases
local fmt = string.format

local function sign_in_required(app)
    if not app.ctx.uid then error("not.authorized", 0) end
end

local function create_article(app)
    local ctx = app.ctx
    local user = User:find_by_id(ctx.uid)

    if not user then error("user.not.exists", 0) end

    local blocks = app.params.blocks

    local d = {
        title = "",
        created_by = ctx.uid,
        author = user.nickname,
        cover = "",
        desc = "",
        content = ngx.req.get_body_data(),
        ts_vector = db.raw("to_tsvector('')"),
        obj = {
            wordcount = 0,
            pageview = 0,
            tags = {},
            author_profile = user.profile,
            ratings_count = 0,
            comments_count = 0
        }
    }
    local sentences = {user.nickname}

    for _, b in ipairs(blocks) do
        if b.type == "header" then
            if #d.title == 0 then d.title = b.data.text end
            d.obj.wordcount = d.obj.wordcount + utf8.len(b.data.text)
            push(sentences, b.data.text)
        elseif b.type == "paragraph" or b.type == "quote" then
            if #d.desc == 0 then d.desc = b.data.text end
            d.obj.wordcount = d.obj.wordcount + utf8.len(b.data.text)
            push(sentences, b.data.text)
        elseif b.type == "list" then
            for _, item in ipairs(b.data.items) do
                d.obj.wordcount = d.obj.wordcount + utf8.len(item)
                push(sentences, item)
            end
        elseif b.type == "image" then
            if #d.cover == 0 then d.cover = b.data.file.url end
        elseif b.type == "code" then
            d.obj.wordcount = d.obj.wordcount + utf8.len(b.data.code)
            push(sentences, b.data.code)
        end
    end

    -- Validation
    if #d.title == 0 then
        error("title.required", 0)
    elseif d.obj.wordcount < 50 then
        error("wordcount.too.small", 0)
    elseif d.obj.wordcount > 1e4 then
        error("wordcount.too.big", 0)
    end

    -- Tokenization
    local tok_res = ngx.location.capture("/internal/nlp/tokenization", {
        method = ngx.HTTP_POST,
        body = cjson.encode({text = sentences})
    })

    if not tok_res.status == 200 then error("nlp.tok." .. tok_res.status, 0) end

    local tok_fine = cjson.decode(tok_res.body)["tok/fine"]
    local tokens_hash = {}
    local tokens = {}

    -- Remove duplicated tokens
    for _, arr in ipairs(tok_fine) do
        for _, t in ipairs(arr) do tokens_hash[t] = 1 end
    end

    for t, _ in pairs(tokens_hash) do tokens[#tokens + 1] = t end

    d.obj = db.raw(fmt("'%s'::jsonb", cjson.encode(d.obj)))
    d.ts_vector = db.raw(fmt("to_tsvector('%s')", table.concat(tokens, " ")))

    local article = Article:create(d)[1]

    return {json = article}
end

local function rate_article(app)
    local uid = app.ctx.uid
    local rating = tonumber(app.params.rating)
    local referrer = app.req.headers["referer"]
    local _, _, article_id_str = string.find(referrer, "/articles/(%d+)")
    local article_id = tonumber(article_id_str)

    if not rating or rating <= 0 or rating > 5 then
        error("rating.invalid", 0)
    end

    if not article_id or article_id <= 0 then error("article.not.exists", 0) end

    Article:create_rating(article_id, uid, rating)

    return {status = 204}
end

local function create_comment(app)
    local ctx = app.ctx
    local uid = ctx.uid
    local article_id = tonumber(app.params.article_id)
    local refer_to = tonumber(app.params.refer_to)

    local user = User:find_by_id(uid)

    if not user then error("user.not.exists", 0) end

    if not article_id then error("article.not.exists", 0) end

    local article = Article:find_by_id(article_id)

    if not article then error("article.not.exists", 0) end

    local reference = {}
    local reference_obj = {}

    if refer_to then
        reference = Article:find_comment_by_id(refer_to)
        reference_obj = cjson.decode(reference.obj)
    end

    local comment_obj_str = cjson.encode({
        reference_id = reference.id,
        reference_author = reference_obj.author,
        reference_profile = reference_obj.profile,
        reference_content = reference_obj.content,
        author = user.nickname,
        profile = user.profile,
        content = ngx.req.get_body_data()
    })

    local comment = {
        created_by = uid,
        article_id = article_id,
        refer_to = refer_to or 0,
        obj = db.raw(fmt("'%s'::jsonb", comment_obj_str))
    }

    assert(Article:create_comment(comment))

    return {status = 204}
end

local function advocate_comment(app)
    local uid = app.ctx.uid
    local comment_id = tonumber(app.params.comment_id)

    if not comment_id then error("comment.not.exist", 0) end

    local advocated = User:has_advocated(uid, comment_id)

    if advocated then
        User:undo_advocation(uid, comment_id)
    else
        User:advocate_comment(uid, comment_id)
    end

    return {json = {advocated = not advocated}}
end

local function article_controller(app)
    app:match("/api/articles", respond_to(
                  {
            before = sign_in_required,
            POST = json_params(create_article)
        }))
    app:match("/api/ratings", respond_to(
                  {before = sign_in_required, POST = json_params(rate_article)}))
    app:match("/api/articles/:article_id/comments", respond_to(
                  {
            before = sign_in_required,
            POST = json_params(create_comment)
        }))
    app:match("/api/comments/:comment_id/advocators", respond_to(
                  {
            before = sign_in_required,
            PUT = json_params(advocate_comment)
        }))
end

return article_controller
