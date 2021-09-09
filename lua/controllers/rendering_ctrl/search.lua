local db = require "lapis.db"
--
local empty = require "util.empty"
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local tags = require "util.tags"

--[[
    lapis.RenderOptions search(lapis.Application)
--]]

local function get_search_placeholder()
    local client = redis_client:new()
    local placeholder = client:run("get", "page(search):placeholder")
    --[[
        string | nil placeholder
    --]]
    return placeholder
end

local function get_latest_followings(uid)
    if uid == nil then return {} end

    local following_ids = PG.query([[
        select following_ids[array_upper(following_ids, 1) - 19 : ?]
        from "user" where id = ?;
    ]], PG.MAX_INT, uid)[1].following_ids

    if empty(following_ids) then return {} end

    local followings = PG.query([[
        select id, profile, nickname from "user" where id in ?;
    ]], db.list(following_ids))
    --[[
        {
            int id,
            string profile,
            string nickname
        } followings[]
    --]]
    return followings
end

local function get_latest_feeds(uid)
    if uid == nil then return {} end

    local feed_ids = PG.query([[
        select feed_ids[array_upper(feed_ids, 1) - 19 : ?] from "user"
        where id = ?;
    ]], PG.MAX_INT, uid)[1].feed_ids

    if empty(feed_ids) then return {} end

    local feeds = PG.query([[
        select id, title, author, cover, rating,
            ceil(wordcount::float / 500) as minutes
        from "article" where id in ?;
    ]], db.list(feed_ids))
    --[[
        {
            int id,
            string title,
            string author,
            string cover,
            double rating,
            int minutes
        } feeds[]
    --]]
    return feeds
end

local function get_authors_of_the_week()
    local famous_authors = PG.query([[
        select id, profile, nickname from "user" order by fame desc limit 20;
    ]])
    -- where created_at > now() - interval '7 days'
    --[[
        {
            int id,
            string profle,
            string nickname
        } famous_authors[]
    --]]
    return famous_authors
end

local function get_articles_of_the_week()
    local famous_articles = PG.query([[
        select id, title, author, cover, rating,
            ceil(wordcount::float / 500) as minutes
        from "article" order by fame desc limit 20;
    ]])
    -- where created_at > now() - interval '7 days'
    --[[
        {
            int id,
            string title,
            string author,
            string cover,
            double rating,
            int minutes
        } famous_articles[]
    --]]
    return famous_articles
end

local function get_user(uid)
    if uid == nil then return end

    local user = PG.query([[
        select id, nickname, profile, followings_count,
            followers_count, articles_count, ratings_count
        from "user" where id = ?;
    ]], uid)[1]
    --[[
        {
            int id,
            string nickname,
            string profile,
            int followings_count,
            int followers_count,
            int articles_count,
            int ratings_count
        } user
    --]]
    return user
end

local function search(app)
    local ctx = app.ctx

    local search_placeholder = get_search_placeholder()
    local latest_followings = get_latest_followings(ctx.uid)
    local latest_feeds = get_latest_feeds(ctx.uid)
    local authors_of_the_week = get_authors_of_the_week()
    local articles_of_the_week = get_articles_of_the_week()
    local user = get_user(ctx.uid)

    ctx.data = {
        search_placeholder = search_placeholder,
        latest_followings = latest_followings,
        latest_feeds = latest_feeds,
        authors_of_the_week = authors_of_the_week,
        articles_of_the_week = articles_of_the_week,
        user = user
    }

    ctx.page_title = "搜索"
    ctx.tags_in_head = {tags:css("search")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("search")}

    return {render = "pages.search"}
end

return search
