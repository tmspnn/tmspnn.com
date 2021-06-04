-- External modules
local db = require "lapis.db"
local json_params = require("lapis.application").json_params
local ngx = require "ngx"
local respond_to = require("lapis.application").respond_to
-- local Sanitizer = require("web_sanitize.html").Sanitizer
local utf8 = require "utf8"
local web_sanitize = require "web_sanitize"
local whitelist = require "web_sanitize.whitelist"

-- Local modules
local Article = require "models/Article"
local User = require "models/User"

-- Aliases
local fmt = string.format

local function sign_in_required(app)
    if not app.ctx.uid then
        error("not.authorized", 0)
    end
end

local function create_article(app)
    local ctx = app.ctx
    ctx.trim_all(app.params)

    local blocks = app.params.blocks
    local user_id = ctx.uid
    local user = User:find_by_id(user_id)
    local d = {
        title = "",
        created_by = user_id,
        author = user.nickname,
        cover = "",
        desc = "",
        content = ngx.req.get_body_data(),
        ts_vector = db.raw("to_tsvector('')"),
        obj = {
            wordcount = 0,
            pageview = 0,
            tags = {}
        }
    }
    local sentences = {}

    for i, b in ipairs(blocks) do
        if b.type == "header" then
            if #d.title == 0 then
                d.title = b.data.text
            end
            d.obj.wordcount = d.obj.wordcount + utf8.len(b.data.text)
            table.insert(sentences, b.data.text)
        elseif b.type == "paragraph" or b.type == "quote" then
            d.obj.wordcount = d.obj.wordcount + utf8.len(b.data.text)
            table.insert(sentences, b.data.text)
        elseif b.type == "list" then
            for i, item in ipairs(b.data.items) do
                d.obj.wordcount = d.obj.wordcount + utf8.len(item)
                table.insert(sentences, item)
            end
        elseif b.type == "image" then
            if #d.cover == 0 then
                d.cover = b.data.file.url
            end
        elseif b.type == "code" then
            d.obj.wordcount = d.obj.wordcount + utf8.len(b.data.code)
            table.insert(sentences, b.data.code)
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
        body = ctx.to_json({
            texts = sentences
        })
    })

    if not tok_res.status == 200 then
        error("nlp.tok." .. tok_res.status, 0)
    end

    local tok_fine = ctx.from_json(tok_res.body)["tok/fine"]
    local tokens_hash = {}
    local tokens = {}

    -- Remove duplicated tokens
    for i, arr in ipairs(tok_fine) do
        for j, t in ipairs(arr) do
            tokens_hash[t] = 1
        end
    end

    for t, _ in pairs(tokens_hash) do
        tokens[#tokens + 1] = t
    end

    d.obj = db.raw(fmt("'%s'::jsonb", ctx.to_json(d.obj)))
    d.ts_vector = db.raw(fmt("to_tsvector('%s')", table.concat(tokens, " ")))

    local article = Article:create(d)

    return {
        json = article
    }
end

local function article_controller(app)
    app:post("/api/articles", respond_to({
        before = sign_in_required,
        POST = json_params(create_article)
    }))
end

return article_controller