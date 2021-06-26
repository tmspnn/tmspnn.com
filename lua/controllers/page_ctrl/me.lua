-- Local modules and aliases
local PG = require "services.PG"
local tags = require "util.tags"

local function get_user(id)
    return PG.query([[
        select * from "user" where id = ?
    ]], id)[1]
end

local function get_articles(id)
    return PG.query([[
        select * from "article" where created_by = ?
        order by id desc limit 50
    ]], id)
end

local function me(app)
    local ctx = app.ctx
    local user = get_user(ctx.uid)

    if not user then error("user.not.exists", 0) end

    user.articles = get_articles(ctx.uid)

    ctx.data = {uid = ctx.uid, user = user}

    ctx.page_title = "一刻阅读 | 我的"
    ctx.tags_in_head = {tags:css("me")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("me")}

    return {render = "pages.me"}
end

return me
