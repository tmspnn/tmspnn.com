local cjson = require "cjson"
--
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local at = require "util.at"
local tags = require "util.tags"
local each = require "util.each"
local empty = require "util.empty"
local push = require "util.push"

local function get_carousel_items()
    local client = redis_client:new()
    local items = client:run("lrange", "page(index):carousel_items", 0, 2) -- 3 items
    each(items, function(v, k)
        items[k] = cjson.decode(v)
    end)
    --[[
        {
            int type, // 0: url, 1: article, 2: author
            int id, // article_id or author_id
            string url,
            string image_url,
            string video_url,
            string text,
            string label,
            string label_color // "#00ffff"
        } items[]
    --]]
    return items
end

local function get_recommended_tags()
    local client = redis_client:new()
    local tags = client:run("lrange", "page(index):recommended_tags", 0, 7) -- 8 tags
    each(tags, function(v, k)
        tags[k] = cjson.decode(v)
    end)
    --[[
        {
            string text,
            string color // "#00ffff"
        } tags[]
    --]]
    return tags
end

local function get_latest_authors()
    local authors = PG.query([[
        select id, profile, nickname from "user" order by id desc limit 20;
    ]])
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
        select
            id, title, author, cover, rating, obj->'tags' as tags,
            ceil(wordcount::float / 500) as minutes
        from "article" order by id desc limit 20;
    ]])
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

local function index(app)
    --[[ lapis.Application app --]]
    local ctx = app.ctx
    local carousel_items = get_carousel_items()
    local recommended_tags = get_recommended_tags()
    local latest_authors = get_latest_authors()
    local latest_articles = get_latest_articles()

    if #carousel_items < 3 then
        for i = 1, 3 - #carousel_items do
            local a = latest_articles[i]
            local item = {
                type = 1,
                id = a.id,
                url = "",
                image_url = a.cover,
                video_url = "",
                text = a.title,
                label = "",
                label_color = ""
            }
            push(carousel_items, item)
        end
    end

    if #recommended_tags < 8 then
        for i = 1, 8 - #recommended_tags do
            local tag = at(latest_articles[i], "tags", 1)
            if tag then
                push(recommended_tags, {
                    text = tag
                })
            end
        end
    end

    ctx.data = {
        uid = ctx.uid,
        carousel_items = carousel_items,
        recommended_tags = recommended_tags,
        latest_authors = latest_authors,
        latest_articles = latest_articles
    }

    ctx.page_title = "首页"
    ctx.tags_in_head = {tags:css("index")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("index")}

    return {
        render = "pages.index"
    }
end

return index
