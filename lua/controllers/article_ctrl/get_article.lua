local cjson = require "cjson"
local db = require "lapis.db"
--
local each = require "util.each"
local empty = require "util.empty"
local PG = require "services.PG"
local redis_client = require "services.redis_client"

--[[
    lapis.RenderOptions get_article(lapis.Application app)
--]]

local function get_article_by_id(id)
    local article = PG.query([[
        select id, title, cover, rating, author, created_at, updated_at,
            content, ceil(wordcount / 500)::integer as minutes, pageview, state
        from "article" where id = ?;
    ]], id)[1]
    --[[
        {
            int id,
            string title,
            string cover,
            double rating,
            string author,
            string created_at,
            string updated_at,
            JSON{blocks: [*]} content,
            int minutes,
            int pageview,
            int state
        } article
    --]]
    return article
end

local function get_comments(article_id)
    local comments = PG.query([[
        select * from "comment" where article_id = ?
        order by advocators_count desc, id desc limit 20;
    ]], article_id);
    if empty(comments) then comments = cjson.empty_array end
    --[[
        {init.sql.comment}[] comments
    --]]
    return comments
end

local function check_my_rating(uid, article_id)
    --[[
        int uid,
        int article_id
    --]]
    local rating_record = PG.query([[
        select id from "rating" where created_by = ? and article_id = ?;
    ]], uid, article_id)[1]
    local has_rated = rating_record[1] ~= nil
    --[[
        bool has_rated
    --]]
    return has_rated
end

local function get_article(app)
    local ctx = app.ctx
    local article_id = tonumber(app.params.article_id)

    if article_id == nil then error('article.not.exists') end

    local article = get_article_by_id(article_id)

    if article == nil or article.state ~= 0 then error('article.not.exists') end

    article.comments = get_comments(article_id)
    article.has_rated = false

    if ctx.uid then article.has_rated = check_my_rating(ctx.uid, article_id) end

    return {json = article}
end

return get_article
