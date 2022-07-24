local cjson = require "cjson"
local db = require "lapis.db"
--
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local fmt = string.format

local function get_comment(comment_id)
    return PG.query([[
        select id, article_id from "comment" where id = ?
    ]], comment_id)[1]
end

local function has_advocated(uid, comment_id)
    local client = redis_client:new()
    return client:run("zscore", fmt("uid(%d):advocated_comments", uid), comment_id) ~= nil
end

local function advocate(uid, comment_id, created_by)
    local client = redis_client:new()
    client:run("zadd", fmt("uid(%d):advocated_comments", uid), comment_id)
    client:run("zadd", fmt("comment(%d):advocators", comment_id), uid)

    PG.query([[
        begin;

        update "comment"
            set advocators_count = advocators_count + 1
        where id = ?;

        update "user" set fame = fame + 1 where id = ?

        commit;
    ]], uid, comment_id, created_by)
end

local function undo_advocation(uid, comment_id, created_by)
    client:run("zrem", fmt("uid(%d):advocated_comments", uid), comment_id)
    client:run("zrem", fmt("comment(%d):advocators", comment_id), uid)

    return PG.query([[
        begin;

        update "comment"
            set advocators_count = advocators_count - 1
        where id = ?;

        update "user" set fame = fame - 1 where id = ?

        commit;
    ]], uid, comment_id, created_by)
end

local function advocate_comment(app)
    local ctx = app.ctx
    local comment_id = assert(tonumber(app.params.comment_id), "comment.not.exist")
    local comment = assert(get_comment(comment_id), "comment.not.exist")
    local article_id = comment.article_id
    local advocated = has_advocated(ctx.uid, comment_id)

    if advocated then
        undo_advocation(ctx.uid, comment_id, comment.created_by)
    else
        advocate(ctx.uid, comment_id, comment.created_by)
    end

    return {
        json = {
            advocated = not advocated
        }
    }
end

return advocate_comment
