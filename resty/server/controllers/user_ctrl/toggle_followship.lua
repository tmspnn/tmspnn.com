local PG = require "services.PG"
local redis_client = require "services.redis_client"
local fmt = string.format

local function has_followed(uid, author_id)
    local client = redis_client:new()
    return client:run("zscore", fmt("uid(%d):followings", uid), author_id) ~= nil
end

local function follow(uid, author_id)
    local client = redis_client:new()
    client:run("zadd", fmt("uid(%d):followings", uid), author_id)
    client:run("zadd", fmt("uid(%d):followers", author_id), uid)

    PG.query([[
        begin;

        update "user" set
            followers_count = followers_count + 1
        where id = ?;

        update "user" set
            followings_count = followings_count + 1
        where id = ?;

        commit;
    ]], author_id, uid)
end

local function unfollow(uid, author_id)
    local client = redis_client:new()
    client:run("zrem", fmt("uid(%d):followings", uid), author_id)
    client:run("zrem", fmt("uid(%d):followers", author_id), uid)

    return PG.query([[
        begin;

        update "user" set
            followers_count = followers_count - 1
        where id = ?;

        update "user" set
            followings_count = followings_count - 1
        where id = ?;

        commit;
    ]], author_id, uid)
end

local function toggle_followship(app)
    local ctx = app.ctx
    local author_id = assert(tonumber(app.params.user_id), "user.not.exists")
    local followed = has_followed(ctx.uid, author_id)

    if followed then
        unfollow(ctx.uid, author_id)
    else
        follow(ctx.uid, author_id)
    end

    return {
        json = {
            followed = not followed
        }
    }
end

return toggle_followship
