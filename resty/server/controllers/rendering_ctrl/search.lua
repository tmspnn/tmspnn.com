local cjson = require "cjson"
local db = require "lapis.db"
--
local empty = require "util.empty"
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local empty = require "util.empty"
local tags = require "util.tags"
local fmt = string.format

local function get_search_placeholder()
    local client = redis_client:new()
    local placeholder = client:run("get", "page(search):placeholder")
    --[[ string | nil placeholder --]]
    return placeholder
end

local function get_latest_followings(uid)
    if uid == nil then
        return {}
    end

    local client = redis_client:new()
    local following_ids = client:run("zrevrange", fmt("uid(%d):followings", uid), 0, 19)

    if #following_ids == 0 then
        return {}
    end

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
    if uid == nil then
        return {}
    end

    local client = redis_client:new()
    local feed_ids = client:run("zrevrange", fmt("uid(%d):feeds", uid), 0, 19)

    if #feed_ids == 0 then
        return {}
    end

    local feeds = PG.query([[
        select
            id, title, author, cover, round(rating, 1) as rating,
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
        select
            id, title, author, cover, rating,
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
    if not uid then
        return
    end

    local user = PG.query([[
        select
            id, nickname, profile, followings_count,
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
    local uid = ctx.uid
    local search_placeholder = get_search_placeholder()
    local latest_followings
    local latest_feeds

    if not uid then
        latest_followings = get_authors_of_the_week()
        latest_feeds = get_articles_of_the_week()
    else
        latest_followings = get_latest_followings(uid)
        latest_feeds = get_latest_feeds(uid)

        if empty(latest_followings) then
            latest_followings = get_authors_of_the_week()
        end

        if empty(latest_feeds) then
            latest_feeds = get_articles_of_the_week()
        end
    end

    ctx.data = {
        uid = uid,
        search_placeholder = search_placeholder,
        latest_followings = latest_followings,
        latest_feeds = latest_feeds
    }

    ctx.page_title = "搜索"
    ctx.tags_in_head = {tags:css("search")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("search")}

    return {
        render = "pages.search"
    }
end

return search
