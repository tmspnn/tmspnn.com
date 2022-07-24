local ngx = require "ngx"
local cjson = require "cjson"
--
local PG = require "services.PG"
local each = require "util.each"
local oss_path_to_url = require "util.oss_path_to_url"

local function search_article(tokens, start_id)
    return PG.query([[
        select
            id, title, author, cover, round(rating, 1) as rating,
            ceil(wordcount::float / 500) as minutes
        from "article"
        where
            id < ?
            and ts_vector @@ to_tsquery(?)
        order by id desc limit 20;
    ]], start_id or PG.MAX_INT, table.concat(tokens, " & "))
end

local function search_users(tokens, start_id)
    return PG.query([[
        select id, profile, nickname from "user"
        where
            id < ?
            and ts_vector @@ to_tsquery(?)
        order by id desc limit 20;
    ]], start_id or 2147483647, table.concat(tokens, " & "))
end

local function search(app)
    local text = assert(app.params.text, "text.required")
    local start_user_id = tonumber(app.params.start_user_id) or PG.MAX_INT
    local start_article_id = tonumber(app.params.start_article_id) or PG.MAX_INT

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
    local users = search_users(tokens, start_user_id)
    local articles = search_article(tokens, start_article_id)

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
