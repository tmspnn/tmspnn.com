-- Local modules
local PG = require "services.PG"

local function has_followed(uid, author_id)
    return PG.query([[
        select id from "interaction"
        where created_by = ? and refer_to = ? and type = 2
    ]], uid, author_id)[1] ~= nil
end

local function follow(uid, author_id)
    return PG.query([[
        begin;

        insert into "interaction"
            (type, created_by, refer_to)
        values
            (2, ?, ?);

        update "user"
        set followers_count = followers_count + 1
        where id = ?;

        update "user"
        set followings_count = followings_count + 1
        where id = ?;

        commit;
    ]], uid, author_id, author_id, uid)
end

local function unfollow(uid, author_id)
    return PG.query([[
        begin;

        delete from "interaction"
        where created_by = ? and refer_to = ? and type = 2;

        update "user"
        set followers_count = followers_count - 1
        where id = ?;

        update "user"
        set followings_count = followings_count - 1
        where id = ?;

        commit;
    ]], uid, author_id, author_id, uid)
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

    return {json = {followed = not followed}}
end

return toggle_followship
