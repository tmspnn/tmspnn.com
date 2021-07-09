local PG = require "services.PG"
local tags = require "util.tags"
--
local function get_user(uid)
    return PG.query([[
        select
            id,
            mobile,
            password,
            nickname,
            profile,
            gender,
            state,
            description,
            location,
            fame,
            email,
            articles_count,
            followings_count,
            followers_count,
            ratings_count,
            obj->'bg_image' as bg_image
        from "user"
        where id = ?
    ]], uid)[1]
end

local function has_followed(uid, author_id)
    return PG.query([[
        select id from "interaction"
        where created_by = ? and refer_to = ? and type = 2
    ]], uid, author_id)[1] ~= nil
end

local function get_articles(id)
    return PG.query([[
        select * from "article" where created_by = ?
        order by id desc limit 50
    ]], id)
end

local function author(app)
    local ctx = app.ctx
    local au = assert(get_user(tonumber(app.params.author_id)),
                      "user.not.exists")
    au.followed = has_followed(ctx.uid, au.id)
    au.be_followed = has_followed(au.id, ctx.uid)
    au.articles = get_articles(au.id)
    ctx.data = {uid = ctx.uid, author = au}
    ctx.page_title = au.nickname .. " | 一刻阅读"
    ctx.tags_in_head = {tags:css("author")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("author")}

    return {render = "pages.author"}
end

return author
