local db = require "lapis.db"
--
local each = require "util.each"
local oss_path_to_url = require "util.oss_path_to_url"
local PG = require "services.PG"
local redis_client = require "services.redis_client"

--[[
    lapis.RenderOptions app_homepage(lapis.Application app)
--]]

local function get_carousel_items()
    local client = redis_client:new()
    local items = client:run("lrange", 'page(index):carousel_items', 0, 5) -- 6 items
    --[[
        JSON{
            int type, // 0: article, 1: author, 2: url
            int id, // article_id or author_id
            string url,
            string image_url,
            string video_url,
            string text,
            string label,
            string label_color // #00ffff
        }[] items
    --]]
    return items
end

local function get_recommended_tags()
    local client = redis_client:new()
    local tags = client:run("lrange", 'page(index):recommended_tags', 0, 7) -- 8 tags
    --[[
        JSON{
            string text,
            string color // #00ffff
        }[] tags
    --]]
    return tags
end

local function get_latest_articles()
    local articles = PG.query([[
        select
            id,
            title,
            author,
            cover,
            rating,
            ceil(wordcount::float / 500) as minutes
        from "article"
        order by id desc limit 20;
    ]])

    each(articles, function(a) a.cover = oss_path_to_url(a.cover) end)

    --[[
        {
            int id,
            string title,
            string author,
            string cover,
            double rating,
            int minutes
        }[] articles
    --]]
    return articles
end

local function get_latest_authors()
    local authors = PG.query([[
        select
            id,
            profile,
            nickname,
            gender,
            articles_count,
            fame
        from "user"
        order by id desc limit 20;
    ]])

    each(authors, function(a) a.profile = oss_path_to_url(a.cover) end)

    --[[
        {
            int id,
            string title,
            string author,
            string cover,
            double rating,
            int minutes
        }[] articles
    --]]
    return authors
end

local function get_articles_of_the_week()
    local famous_articles = PG.query([[
        select
            id,
            title,
            author,
            cover,
            rating,
            ceil(wordcount::float / 500) as minutes
        from "article"
        order by fame desc limit 20;
    ]])

    each(famous_articles, function(a) a.cover = oss_path_to_url(a.cover) end)

    --[[
        {
            int id,
            string title,
            string author,
            string cover,
            double rating,
            int minutes
        }[] articles
    --]]
    return famous_articles
end

local function get_authors_of_the_week()
    local famous_authors = PG.query([[
        select
            id,
            profile,
            nickname,
            gender,
            articles_count,
            fame
        from "user"
        order by fame desc limit 20;
    ]])

    each(famous_authors, function(a) a.profile = oss_path_to_url(a.cover) end)

    --[[
        {
            int id,
            string title,
            string author,
            string cover,
            double rating,
            int minutes
        }[] articles
    --]]
    return famous_authors
end

local function get_latest_followings(uid)
    if uid == nil then return {} end

    local following_ids = PG.query([[
        select
            following_ids[array_upper(following_ids, 1) - 19 : ?]
        from "user"
        where id = ?;
    ]], PG.MAX_INT, uid)[1].following_ids

    local followings = PG.query([[
        select id, profile, nickname from "user" where id in ?
    ]], db.list(following_ids))

    --[[
        {
            int id,
            string profile,
            string nickname
        }[] followings
    --]]
    return followings
end

local function get_latest_feeds(uid)
    if uid == nil then return {} end

    local feed_ids = PG.query([[
        select
            feed_ids[array_upper(feed_ids, 1) - 19 : ?]
        from "user"
        where id = ?;
    ]], PG.MAX_INT, uid)[1].feed_ids

    local feeds = PG.query([[
        select
            id,
            title,
            author,
            cover,
            rating,
            ceil(wordcount::float / 500) as minutes
        from "article"
        where id in ?
    ]], db.list(feed_ids))

    --[[
        {
            int id,
            string title,
            string author,
            string cover,
            double rating,
            int minutes
        }[] feeds
    --]]
    return feeds
end

local function app_homepage(app)
    local ctx = app.ctx

    local carousel_items = get_carousel_items()
    local recommended_tags = get_recommended_tags()
    local latest_articles = get_latest_articles()
    local latest_authors = get_latest_authors()
    local articles_of_the_week = get_articles_of_the_week()
    local authors_of_the_week = get_authors_of_the_week()
    local latest_followings = get_latest_followings(ctx.uid)
    local latest_feeds = get_latest_feeds(ctx.uid)

    return {
        json = {
            uid = ctx.uid,
            carousel_items = carousel_items,
            recommended_tags = recommended_tags,
            latest_articles = latest_articles,
            latest_authors = latest_authors,
            articles_of_the_week = articles_of_the_week,
            authors_of_the_week = authors_of_the_week,
            latest_followings = latest_followings,
            latest_feeds = latest_feeds
        }
    }
end

return app_homepage
