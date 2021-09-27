local cjson = require "cjson"
local db = require "lapis.db"
--
local each = require "util.each"
local empty = require "util.empty"
local PG = require "services.PG"
local redis_client = require "services.redis_client"

local function get_carousel_items()
    local client = redis_client:new()
    local items = client:run("lrange", "page(index):carousel_items", 0, 5)
    -- 6 items
    each(items, function(v, k)
        items[k] = cjson.decode(v)
    end)
    --[[
		{
		int type, // 0: article, 1: author, 2: url
		int id, // article_id or author_id
		string url,
		string image_url,
		string video_url,
		string text,
		string label,
		string label_color // #00ffff
		} items[]
	--]]
    return empty(items) and cjson.empty_array or items
end

local function get_recommended_tags()
    local client = redis_client:new()
    local tags = client:run("lrange", "page(index):recommended_tags", 0, 7)
    -- 8 tags
    each(tags, function(v, k)
        tags[k] = cjson.decode(v)
    end)
    --[[
		{
		string text,
		string color // #00ffff
		} tags[]
    --]]
    return empty(tags) and cjson.empty_array or tags
end

local function get_latest_authors()
    local authors = PG.query [[
        select id, profile, nickname from "user" order by id desc limit 20;
    ]]
    --[[
		{
		int id,
		string profle,
		string nickname
		} authors[]
    --]]
    return empty(authors) and cjson.empty_array or authors
end

local function get_latest_articles()

    local articles = PG.query([[
        select id, title, author, cover, rating,
            ceil(wordcount::float / 500) as minutes
        from "article" order by id desc limit 20;
    ]], nil)
    --[[
		{
		int id,
		string title,
		string author,
		string cover,
		double rating,
		int minutes
		} articles[]
    --]]
    return empty(articles) and cjson.empty_array or articles
end

local function get_search_placeholder()
    local client = redis_client:new()
    local placeholder = client:run("get", "page(search):placeholder")
    --[[
		string | nil placeholder
    --]]
    return placeholder
end

local function get_latest_followings(uid)
    if uid == nil then
        return cjson.empty_array
    end
    local following_ids = PG.query(
                              '\n        select following_ids[array_upper(following_ids, 1) - 19 : ?]\n        from "user" where id = ?;\n    ',
                              PG.MAX_INT, uid)[1].following_ids
    if empty(following_ids) then
        return cjson.empty_array
    end
    local followings = PG.query('\n        select id, profile, nickname from "user" where id in ?;\n    ',
        db.list(following_ids))
    --[[
		{
		int id,
		string profile,
		string nickname
		} followings[]
    --]]
    return empty(followings) and cjson.empty_array or followings
end

local function get_latest_feeds(uid)
    if uid == nil then
        return cjson.empty_array
    end
    local feed_ids = PG.query(
                         '\n        select feed_ids[array_upper(feed_ids, 1) - 19 : ?] from "user"\n        where id = ?;\n    ',
                         PG.MAX_INT, uid)[1].feed_ids
    if empty(feed_ids) then
        return cjson.empty_array
    end
    local feeds = PG.query([[
        select
            id, title, author, cover, rating,
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
		--
	]]
    return empty(feeds) and cjson.empty_array or feeds
end

local function get_authors_of_the_week()
    local famous_authors =
        PG.query '\n        select id, profile, nickname from "user" order by fame desc limit 20;\n    '
    --[[
		{
		int id,
		string profle,
		string nickname
		} famous_authors[]
    --]]
    return empty(famous_authors) and cjson.empty_array or famous_authors
end

local function get_articles_of_the_week()
    local famous_articles = PG.query [[
    select
        id, title, author, cover, rating,
        ceil(wordcount::float / 500) as minutes
    from "article" order by fame desc limit 20;]]
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
    return empty(famous_articles) and cjson.empty_array or famous_articles
end

local function get_user(uid)
    if uid == nil then
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

local function app_homepage(app)
    local ctx = app.ctx
    local carousel_items = get_carousel_items()
    local recommended_tags = get_recommended_tags()
    local latest_authors = get_latest_authors()
    local latest_articles = get_latest_articles()
    local search_placeholder = get_search_placeholder()
    local latest_followings = get_latest_followings(ctx.uid)
    local latest_feeds = get_latest_feeds(ctx.uid)
    local authors_of_the_week = get_authors_of_the_week()
    local articles_of_the_week = get_articles_of_the_week()
    local user = get_user(ctx.uid)
    return {
        json = {
            uid = ctx.uid,
            carousel_items = carousel_items,
            recommended_tags = recommended_tags,
            latest_authors = latest_authors,
            latest_articles = latest_articles,
            search_placeholder = search_placeholder,
            latest_followings = latest_followings,
            latest_feeds = latest_feeds,
            authors_of_the_week = authors_of_the_week,
            articles_of_the_week = articles_of_the_week,
            user = user
        }
    }
end

return app_homepage
