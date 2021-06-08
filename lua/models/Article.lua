-- External modules
local cjson = require "cjson"
local date = require "date"
local db = require "lapis.db"

-- Alias
local fmt = string.format

-- Local modules
local Model = require "models/Model"
local redis_client = require "models/redis_client"

local Article = Model:new("article")

function Article:get_related(article_id)
    return self:find([[
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
        title = article.title
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
            weight = weight + ?
        where id = ?;

        update "user"
        set
            fame = fame + (? - 3) * least(greatest(1, ? / fame), 50)
        where id = ?;

        commit;
    ]], uid, article_id, rating, user.fame,
                      db.raw(fmt("'%s'::jsonb", rating_obj_str)), rating,
                      user.fame, user.fame, user.fame, article_id, rating,
                      user.fame, article.created_by))
end

-- function article:get_latest(start_id)
--     local condition = start_id and "where id < ?" or ""
--     local params = start_id and {start_id} or {}
--     local sql = fmt([[ * from "article" %s order by id desc limit 20 ]], condition)
--     return self:find(sql, unpack(params))
-- end

-- function article:get_recommended_topics()
--     local client = redis_client:new()
--     return client:run("zrevrangebyscore", "recommended_topics", "+inf", 0, "limit", 0, 10)
-- end

-- function article:create_comment(init_data)
--     return db.insert("comment", init_data, db.raw("*"))
-- end

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
