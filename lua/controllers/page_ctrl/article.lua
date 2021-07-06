-- External modules
local cjson = require "cjson"
local db = require "lapis.db"

-- Local modules
local at = require "util.at"
local each = require "util.each"
local has_value = require "util.has_value"
local lambda = require "util.lambda"
local map = require "util.map"
local oss_path_to_url = require "util.oss_path_to_url"
local PG = require "services.PG"
local tags = require "util.tags"

local function get_article_by_id(id)
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
            content,
            state,
            obj,
            created_at,
            updated_at
        from "article"
        where id = ?
    ]], id)[1]
end

local function get_comments(article_id)
    local comments = PG.query([[
        select * from "comment"
        where article_id = ?
        order by advocators_count desc, id desc
        limit 20
    ]], article_id)

    each(comments, function(c)
        c.author_profile = oss_path_to_url(c.author_profile)

        if c.reference_author_profile ~= "" then
            c.reference_author_profile = oss_path_to_url(
                                             c.reference_author_profile)
        end

        c.blocks = cjson.decode(c.content).blocks

        each(c.blocks, function(b)
            if at(b, "data", "file", "url") then
                b.data.file.url = oss_path_to_url(b.data.file.url)
            end
        end)

        if c.reference_content ~= "" then
            c.reference_blocks = cjson.decode(c.reference_content).blocks
            each(c.reference_blocks, function(b)
                if at(b, "data", "file", "url") then
                    b.data.file.url = oss_path_to_url(b.data.file.url)
                end
            end)
        end
    end)

    return comments
end

local function get_advocated(uid, comment_ids)
    return PG.query([[
        select id from "comment"
        where created_by = ? and id in ?
    ]], uid, db.list(comment_ids))
end

local function get_related(article_id)
    return PG.query([[
        select
            id,
            title,
            cover,
            author,
            author_profile,
            created_by,
            created_at,
            pageview
        from "article"
        where id < ? limit 3
    ]], article_id)
end

local function get_rating(uid, article_id)
    local rating = PG.query([[
        select * from "rating" where created_by = ? and article_id = ?
    ]], uid, article_id)[1]
    return rating and rating.rating
end

local function article(app)
    local ctx = app.ctx

    local article_id = tonumber(app.params.article_id)

    local a = get_article_by_id(article_id)

    if not a then error("article.not.exists", 0) end

    a.cover = oss_path_to_url(a.cover)
    a.author_profile = oss_path_to_url(a.author_profile)
    a.blocks = cjson.decode(a.content).blocks

    each(a.blocks, function(b)
        if at(b, "data", "file", "url") then
            b.data.file.url = oss_path_to_url(b.data.file.url)
        end
    end)

    a.comments = get_comments(article_id)
    a.related_articles = get_related(article_id)

    if (ctx.uid) then
        local advocated = get_advocated(ctx.uid,
                                        map(a.comments, lambda("c", "c.id")))
        local advocated_ids = map(advocated, lambda("c", "c.id"))

        each(a.comments, function(c)
            if has_value(advocated_ids, c.id) then c.advocated = true end
        end)

        a.my_rating = get_rating(ctx.uid, article_id)
    end

    ctx.data = {uid = ctx.uid, article = a}

    ctx.page_title = a.title
    ctx.tags_in_head = {tags:css("article")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("article")}

    return {render = "pages.article"}
end

return article
