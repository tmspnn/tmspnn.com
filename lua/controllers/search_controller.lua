local ngx = require "ngx"
local cjson = require "cjson"
--
local PG = require "services.PG"
local each = require "util.each"
local oss_path_to_url = require "util.oss_path_to_url"

local function search_article(tokens, start_id)
    return PG.query([[
        select
            id, title, author, cover, rating, obj->'tags' as tags,
            ceil(wordcount::float / 500) as minutes
        from "article"
        where
            id < ?
            and ts_vector @@ to_tsquery(?)
        order by id desc limit 10
    ]], start_id or PG.MAX_INT, table.concat(tokens, " & "))
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
        body = cjson.encode({
            text = text
        })
    })

    assert(tok_res.status == 200, tok_res.body)

    local tokens = cjson.decode(tok_res.body)["tok/fine"][1]
    local articles = search_article(tokens)
    local users = search_users(tokens)

    return {
        json = {
            articles = articles,
            users = users
        }
    }
end

local function search_controller(app)
    --[[ lapis.Application app --]]
    app:get("/api/search", search)
end

return search_controller
