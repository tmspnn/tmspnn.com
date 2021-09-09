local cjson = require "cjson"
--
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local tags = require "util.tags"
local each = require "util.each"
local empty = require "util.empty"

--[[
    lapis.RenderOptions me(lapis.Application app)
--]]

local function get_user(uid)
    return PG.query([[
        select id, nickname, profile, fame, gender, location, articles_count,
            followings_count, followers_count, ratings_count, description,
            obj->'bg_image' as bg_image
        from "user" where id = ?;
    ]], uid)[1]
end

local function get_articles(uid)
    return PG.query([[
        select id, title, author, cover, rating,
            ceil(wordcount::float / 500) as minutes
        from "article" where created_by = ? order by id desc limit 50;
    ]], uid)
end

local function me(app)
    local ctx = app.ctx
    local user = get_user(ctx.uid)

    if not user then error("user.not.exists") end

    user.articles = get_articles(ctx.uid)

    ctx.data = {uid = ctx.uid, user = user}

    ctx.page_title = "我的"
    ctx.tags_in_head = {tags:css("me")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("me")}

    return {render = "pages.me"}
end

return me
