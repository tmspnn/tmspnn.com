-- Local modules
local PG = require "services.PG"
local tags = require "util.tags"

local function get_hot_articles_7d()
    return PG.query([[
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
        where created_at > now() - interval '7 days'
        order by fame desc limit 50
    ]])
end

local function get_hot_authors_7d()
    return PG.query([[
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
        where created_at > now() - interval '7 days'
        order by fame desc limit 50
    ]])
end

local function trending(app)
    local ctx = app.ctx
    local articles_7d = get_hot_articles_7d()
    local authors_7d = get_hot_authors_7d()

    ctx.data = {
        uid = ctx.uid,
        articles_7d = articles_7d,
        authors_7d = authors_7d
    }

    ctx.page_title = "一刻阅读 | 排行"
    ctx.tags_in_head = {tags:css("trending")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("trending")}

    return {render = "pages.trending"}
end

return trending
