-- External modules
local cjson = require "cjson"
local ngx = require "ngx"

-- Local modules
local PG = require "services.PG"
local each = require "util.each"

local function search_article(tokens, start_id)
    return PG.query([[
        select
            id, created_by, author, author_profile, title, summary,
            cover, rating, created_at, wordcount, pageview
        from "article"
        where
            id < ?
            and ts_vector @@ to_tsquery(?)
        order by id desc limit 10
    ]], start_id or 2147483647, table.concat(tokens, " & "))
end

local function search_users(tokens, start_id)
    return PG.query([[
        select
            id, nickname, profile, description, fame,
            articles_count, followings_count, followers_count
        from "user"
        where
            id < ?
            and ts_vector @@ to_tsquery(?)
        order by id desc limit 10
    ]], start_id or 2147483647, table.concat(tokens, " & "))
end

local function search(app)
    local text = app.params.text

    -- Tokenization
    ngx.req.set_header("Content-Type", "application/json")
    local tok_res = ngx.location.capture("/internal/nlp/tokenization", {
        method = ngx.HTTP_POST,
        body = cjson.encode({text = text})
    })

    if tok_res.status ~= 200 then error(tok_res.body) end

    local tokens = cjson.decode(tok_res.body)["tok/fine"][1]

    local articles = search_article(tokens)

    local users = search_users(tokens)

    return {json = {articles = articles, users = users}}
end

local function search_controller(app) app:get("/api/search", search) end

return search_controller
