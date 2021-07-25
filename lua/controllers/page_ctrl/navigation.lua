--
local each = require "util.each"
local oss_path_to_url = require "util.oss_path_to_url"
local PG = require "services.PG"
local redis_client = require "services.redis_client"

--[[
    {table json} navigation(lapis.Application app)
--]]

local function get_search_placeholder()
    local client = redis_client:new()
    return client:run("get", "page(index):search_placeholder")
end

local function get_recommended_tags()
    local client = redis_client:new()
    return client:run("zrevrangebyscore", "page(index):recommended_tags",
                      "+inf", 0, "limit", 0, 20)
end

local function get_latest_articles()
    local articles = PG.query([[
        select * from "article" order by id desc limit 20;
    ]])

    each(articles, function(a) a.cover = oss_path_to_url(a.cover) end)

    return articles
end

local function get_hot_articles_7d()
    local articles = PG.query([[
        select
            id,
            created_by,
            rating,
            weight,
            fame,
            cover,
            title,
            author,
            author_profile,
            summary,
            wordcount,
            pageview,
            created_at,
            updated_at
        from  "article"
        order by fame desc limit 50
    ]])

    each(articles, function(a)
        a.cover = oss_path_to_url(a.cover)
        a.author_profile = oss_path_to_url(a.author_profile)
    end)

    return articles
end

local function get_hot_authors_7d()
    local authors = PG.query([[
        select
            id,
            nickname,
            profile,
            fame,
            gender,
            description,
            location,
            articles_count,
            followings_count,
            followers_count
        from  "user"
        order by fame desc limit 50
    ]])

    each(authors, function(a) a.profile = oss_path_to_url(a.profile) end)

    return authors
end

local function get_articles(user_id)
    local articles = PG.query([[
        select * from "article" where created_by = ?
        order by id desc limit 50;
    ]], user_id)

    each(articles, function(a)
        a.cover = oss_path_to_url(a.cover)
        a.author_profile = oss_path_to_url(a.author_profile)
    end)

    return articles
end

local function get_user(id)
    local u = PG.query([[
        select *, obj->'bg_image' as bg_image from "user" where id = ?;
    ]], id)[1]

    if u then
        u.profile = oss_path_to_url(u.profile)
        u.bg_image = oss_path_to_url(u.bg_image)
        u.articles = get_articles(u.id)
        u.password = nil
    end

    return u
end

local function navigation(app)
    local ctx = app.ctx
    local tb = {uid = ctx.uid}

    tb.search_placeholder = get_search_placeholder()
    tb.recommended_tags = get_recommended_tags()
    tb.latest_articles = get_latest_articles()
    tb.articles_7d = get_hot_articles_7d()
    tb.authors_7d = get_hot_authors_7d()

    if tb.uid then tb.user = get_user(ctx.uid) end

    return {json = tb}
end

return navigation
