-- Local modules and aliases
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local tags = require "controllers.page_ctrl.tags"

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
    return PG.query([[
        select *
        from "article"
        order by id desc limit 20
    ]])
end

local function index(app)
    local ctx = app.ctx
    local search_placeholder = get_search_placeholder()
    local recommended_tags = get_recommended_tags()
    local latest_articles = get_latest_articles()

    ctx.data = {
        uid = ctx.uid,
        search_placeholder = search_placeholder,
        recommended_tags = recommended_tags,
        latest_articles = latest_articles
    }

    ctx.page_title = "一刻阅读 | 首页"
    ctx.tags_in_head = {tags:css("index")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("index")}

    return {render = "pages.index"}
end

return index
