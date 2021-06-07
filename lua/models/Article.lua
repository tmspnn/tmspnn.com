-- External modules
local date = require "date"
local db = require "lapis.db"

-- Alias
local fmt = string.format

-- Local modules
local Model = require "models/Model"
local redis_client = require "models/redis_client"

local Article = Model:new("article")

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
