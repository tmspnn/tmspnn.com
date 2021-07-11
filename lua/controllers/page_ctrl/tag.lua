local ngx = require "ngx"
local cjson = require "cjson"
--
local PG = require "services.PG"
local each = require "util.each"
local oss_path_to_url = require "util.oss_path_to_url"
local tags = require "util.tags"
local unescape = require "util.unescape"
--
local function search_article(tokens, start_id)
    local articles = PG.query([[
        select
            id, created_by, author, author_profile, title, summary,
            cover, rating, created_at, wordcount, pageview
        from "article"
        where
            id < ?
            and ts_vector @@ to_tsquery(?)
        order by id desc limit 20
    ]], start_id or 2147483647, table.concat(tokens, " & "))

    return articles
end

local function tag(app)
    local ctx = app.ctx
    local tag_name = unescape(app.params.tag_name)

    -- Tokenization
    ngx.req.set_header("Content-Type", "application/json")

    local tok_res = ngx.location.capture("/internal/nlp/tokenization", {
        method = ngx.HTTP_POST,
        body = cjson.encode({text = tag_name})
    })

    if tok_res.status ~= 200 then error(tok_res.body) end

    local tokens = cjson.decode(tok_res.body)["tok/fine"][1]

    local result = search_article(tokens)

    ctx.data = {result = result}

    ctx.page_title = tag_name
    ctx.tags_in_head = {tags:css("tag")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("tag")}

    return {render = "pages.tag"}
end

return tag
