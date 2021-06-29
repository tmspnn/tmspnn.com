-- Local modules
local PG = require "services.PG"

local function has_followed(uid, author_id)
    return PG.query([[
        select id from "interaction"
        where created_by = ? and refer_to = ? and type = 2
    ]], uid, author_id)[1]
end

local function follow(uid, author_id)
    return PG.query([[
        insert into "interaction"
            (type, created_by, refer_to)
        values
            (2, ?, ?)
    ]], uid, author_id)
end

local function unfollow(uid, author_id)
    return PG.query([[
        delete from "interaction"
        where created_by = ? and refer_to = ? and type = 2
    ]], uid, author_id)
end

local function toggle_followship(app)
    local author_id = tonumber(app.params.user_id)

    if not author_id then error("user.not.exists", 0) end

    local uid = app.ctx.uid

    local followed = has_followed(uid, author_id)

    if followed then
        unfollow(uid, author_id)
    else
        follow(uid, author_id)
    end

    return {json = {followed = not has_followed}}
end

return toggle_followship
