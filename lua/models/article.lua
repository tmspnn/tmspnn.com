-- @External
local db = require "lapis.db"
local util = require "util"

-- Local modules
local model = require "models/model"
local redis_client = require "models/redis_client"

local article = model:new("article")

function article:get_latest(start_id)
    local condition = start_id and "where id < ?" or ""
    local params = start_id and {start_id} or {}
    local sql = string.format("* from article %s order by id desc limit 20",
                              condition)
    return self:find(sql, unpack(params))
end

function article:get_recommended_topics()
    local client = redis_client:new()
    return client:run("zrevrangebyscore", "recommended_topics", "+inf", 0,
                      "limit", 0, 10)
end

function article:create_comment(init_data)
    return db.insert("comment", init_data, db.raw("*"))
end

function article:add_comment_advocator(comment_id, uid)
    local client = redis_client:new()
    return client:run("zadd",
                      string.format("comments(%d):advocators", comment_id),
                      util.timestamp(), uid)
end

function article:remove_comment_advocator(comment_id, uid)
    local client = redis_client:new()
    return client:run("zrem",
                      string.format("comments(%d):advocators", comment_id), uid)
end

function article:add_comment_opposer(comment_id, uid)
    local client = redis_client:new()
    return client:run("zadd",
                      string.format("comments(%d):opposers", comment_id),
                      util.timestamp(), uid)
end

function article:remove_comment_opposer(comment_id, uid)
    local client = redis_client:new()
    return client:run("zrem",
                      string.format("comments(%d):opposers", comment_id), uid)
end

return article
