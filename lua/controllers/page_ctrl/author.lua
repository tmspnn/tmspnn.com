-- Local modules and aliases
local PG = require "services.PG"
local tags = require "util.tags"

local function get_user(id)
    return PG.query([[
        select * from "user" where id = ?
    ]], id)[1]
end

local function has_followed(uid, author_id)
    return PG.query([[
        select id from "interaction"
        where created_by = ? and refer_to = ? and type = ?
    ]], uid, author_id, 2)[1] ~= nil -- 1: comment_advocation, 2: followship
end

local function get_articles(id)
    return PG.query([[
        select * from "article" where created_by = ?
        order by id desc limit 50
    ]], id)
end

local function author(app)
    local ctx = app.ctx
    local author_id = tonumber(app.params.author_id)

    if not author_id then return {status = 404, render = "pages.404"} end

    local author = get_user(author_id)

    if not author then return {status = 404, render = "pages.404"} end

    author.followed = has_followed(ctx.uid, author_id)

    author.articles = get_articles(author_id)

    ctx.data = {uid = ctx.uid, author = author}

    ctx.page_title = author.nickname .. " | 一刻阅读"
    ctx.tags_in_head = {tags:css("author")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("author")}

    return {render = "pages.author"}
end

return author
