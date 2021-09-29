local cjson = require "cjson"
local db = require "lapis.db"
--
local each = require "util.each"
local empty = require "util.empty"
local map = require "util.map"
local has_value = require "util.has_value"
local PG = require "services.PG"
local redis_client = require "services.redis_client"

local function get_article_by_id(id)
    local article = PG.query([[
        select
            id, title, cover, rating, author, created_at, updated_at,
            created_by, content, ceil(wordcount / 500)::integer as minutes,
            pageview, state, author_profile
        from "article" where id = ?;
    ]], id)[1]
    --[[
        {
            int id,
            string title,
            string cover,
            double rating,
            string author,
            string created_at,
            string updated_at,
            JSON{blocks: [*]} content,
            int minutes,
            int pageview,
            int state
        } article
    --]]
    return article
end

local function get_comments(article_id, uid)
    local comments = PG.query([[
        select * from "comment" where article_id = ? and state = 0
        order by advocators_count desc, id desc limit 20;
    ]], article_id);

    if empty(comments) then
        return cjson.empty_array
    end

    if uid then
        local advocated = PG.query([[
            select refer_to from "interaction"
            where created_by = ? and id in ? and type = 1;
        ]], uid, db.list(map(comments, function(c)
            return c.id
        end)))

        local advocated_ids = map(advocated, function(itrct)
            return itrct.refer_to
        end)

        each(comments, function(c)
            if has_value(advocated_ids, c.id) then
                c.advocared = true
            end
        end)
    end

    return comments
end

local function check_my_rating(uid, article_id)
    local rating_record = PG.query([[
        select id from "rating" where created_by = ? and article_id = ?;
    ]], uid, article_id)[1]
    return rating_record ~= nil
end

local function get_author(id, follower_id)
    if not follower_id then
        return PG.query([[
            select
                id, nickname, profile, fame, articles_count, false as followed
            from "user" where id = ?;
        ]], id)[1]
    end

    return PG.query([[
        select
            id, nickname, profile, fame, articles_count,
            follower_ids @> array[?] as followed
        from "user" where id = ?;
    ]], follower_id, id)[1]
end

local function get_article(app)
    local ctx = app.ctx
    local article_id = assert(tonumber(app.params.article_id), "article.not.exists")
    local article = assert(get_article_by_id(article_id), "article.not.exists")
    assert(article.state == 0, "forbidden")
    article.comments = get_comments(article_id, ctx.uid)
    article.creator = get_author(article.created_by, ctx.uid)
    article.has_rated = false

    if ctx.uid then
        article.has_rated = check_my_rating(ctx.uid, article_id)
    end

    return {
        json = article
    }
end

return get_article
