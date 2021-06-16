-- External modules
local cjson = require "cjson"
local date = require "date"
local db = require "lapis.db"

-- Alias
local fmt = string.format

-- Local modules
local Model = require "models/Model"
local redis_client = require "models/redis_client"

-- Implementation
local Article = Model:new("article")
local MAX_INT = 2147483647

function Article:get_search_placeholder()
    local client = redis_client:new()
    return client:run("get", "search_placeholder")
end

-- @param {unsigned int} start_id
function Article:get_latest(start_id)
    return self:query([[
        select
            id, created_by, author, title, "desc", cover, rating, created_at,
            obj->'wordcount' as wordcount, obj->'pageview' as pageview,
            obj->'author_profile' as author_profile
        from "article"
        where id < ?
        order by id desc limit 20
    ]], start_id or MAX_INT)
end

function Article:get_recommended_tags()
    local client = redis_client:new()
    return client:run("zrevrangebyscore", "recommended_tags", "+inf", 0,
                      "limit", 0, 10)
end

function Article:get_related(article_id)
    return self:query([[
        select
            id, title, cover, author, obj, created_by, created_at, updated_at
        from "article"
        where id < ? limit 3
    ]], article_id)
end

function Article:get_rating(uid, article_id)
    local rating = self:query([[
        select * from "rating" where created_by = ? and article_id = ?
    ]], uid, article_id)[1]
    return rating and rating.rating
end

--
function Article:create_rating(article_id, uid, rating)
    local user = self:query([[
        select nickname, profile, fame from "user" where id = ?
    ]], uid)[1]

    local article = self:query([[
        select title, created_by from "article" where id = ?
    ]], article_id)[1]

    local rating_obj_str = cjson.encode({
        author = user.nickname,
        author_profile = user.profile,
        article_title = article.title
    })

    assert(self:query([[
        begin;

        set local lock_timeout = '1s';

        select pg_advisory_xact_lock(0);

        insert into rating (created_by, article_id, rating, weight, obj)
        values (?, ?, ?, ?, ?);

        update "article"
        set
            rating = (rating * weight + ? * ?) / (weight + ?),
            weight = weight + ?,
            fame = rating * weight + (? - 3) * ?
        where id = ?;

        update "user"
        set
            fame = fame + (? - 3) * least(greatest(1, ? / fame), 50)
        where id = ?;

        commit;
    ]], uid, article_id, rating, user.fame,
                      db.raw(fmt("'%s'::jsonb", rating_obj_str)), rating,
                      user.fame, user.fame, user.fame, rating, user.fame,
                      article_id, rating, user.fame, article.created_by))
end

function Article:find_comment_by_id(comment_id)
    return self:query([[
        select * from "comment" where id = ?
    ]], comment_id)[1]
end

function Article:create_comment(data) return db.insert("comment", data) end

function Article:get_comments_by_article_id(article_id, start_id)
    return self:query([[
        select * from "comment"
        where article_id = ? and id < ?
        order by advocators_count desc limit 20
    ]], article_id, start_id or MAX_INT)
end

-- @param {string[]} tokens
-- @param {unsigned int} start_id
function Article:search(tokens, start_id)
    local q = table.concat(tokens, " & ")
    return self:query([[
        select
            id, created_by, author, title, "desc", cover, rating, created_at,
            obj->>'wordcount' as wordcount, obj->>'pageview' as pageview,
            obj->>'author_profile' as author_profile
        from "article"
        where
            id < ?
            and ts_vector @@ to_tsquery(?)
        order by id desc limit 10
    ]], start_id or 2147483647, q)
end

function Article:get_hot_articles_7d()
    return self:query([[
        select
            id, created_by, author, title, "desc", cover, rating, created_at,
            obj->'pageview' as pageview,
            obj->'author_profile' as author_profile
        from  "article"
        where created_at > now() - interval '7 days'
        order by fame desc limit 50
    ]])
end

-- @param {unsigned int} author_id
-- @param {unsigned int} start_id
function Article:get_by_author(author_id, start_id)
    return self:query([[
        select
            id, created_by, author, title, "desc", cover, rating, created_at,
            obj->'wordcount' as wordcount, obj->'pageview' as pageview,
            obj->'author_profile' as author_profile
        from "article"
        where created_by = ? and id < ?
        order by id desc limit 20
    ]], author_id, start_id or MAX_INT)
end

-- function article:add_comment_advocator(comment_id, uid)
--     local client = redis_client:new()
--     return client:run("zadd", fmt("comment(%d):advocators", comment_id), util.timestamp(), uid)
-- end

-- function article:remove_comment_advocator(comment_id, uid)
--     local client = redis_client:new()
--     return client:run("zrem", fmt("comment(%d):advocators", comment_id), uid)
-- end

-- function article:add_comment_opposer(comment_id, uid)
--     local client = redis_client:new()
--     return client:run("zadd", fmt("comment(%d):opposers", comment_id), util.timestamp(), uid)
-- end

-- function article:remove_comment_opposer(comment_id, uid)
--     local client = redis_client:new()
--     return client:run("zrem", fmt("comment(%d):opposers", comment_id), uid)
-- end

-- function article:regularize(ins)
--     ins.created_at = date(ins.created_at):fmt("%Y/%m/%d %H:%M")
--     ins.rating = fmt("%.2f", ins.rating)
--     ins.keywords = util.split(ins.keywords, ",")
-- end

-- function article:add_rater(article_id, rater_id, rating)
--     local client = redis_client:new()
--     return client:run("zadd", fmt("article(%d):raters", article_id), rating, rater_id)
-- end

-- function article:get_rating_by_uid(article_id, uid)
--     local client = redis_client:new()
--     local score = client:run("zscore", fmt("article(%d):raters", article_id), uid or 0)
--     return tonumber(score)
-- end

-- function article:set_hot_comment(article_id, comment_id, advocators_count)
--     local client = redis_client:new()
--     return client:run("zadd", fmt("article(%d):hot_comments", article_id), advocators_count, comment_id)
-- end

-- function article:remove_hot_comment(article_id, comment_id)
--     local client = redis_client:new()
--     return client:run("zrem", fmt("article(%d):hot_comments", article_id), comment_id)
-- end

return Article
