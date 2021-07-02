-- External modules
local db = require "lapis.db"

-- Local modules
local PG = require "services.PG"

-- Has user a followed user b
-- @param {unsigned int} a
-- @param {unsigned int} b
local function has_followed(a, b)
    return PG.query([[
        select id from "interaction"
        where created_by = ? and refer_to = ? and type = ?
    ]], a, b, 2)[1] ~= nil -- 1: comment_advocation, 2: followship
end

local function get_conv_between(sender_id, recipient_id)
    return PG.query([[
        select * from "conversation"
        where
            created_by in (?, ?) and
            array_length(members, 1) = 2 and
            members @> '{?, ?}'
    ]], sender_id, recipient_id, sender_id, recipient_id)[1]
end

local function new_conversation(sender_id, recipient_id)
    return PG.query([[
        insert into "conversation"
            (created_by, members, title)
        values
            (?, ?, ?)
        returning *
    ]], sender_id, db.array({sender_id, recipient_id}), "")[1]
end

local function create_conversation(app)
    local sender_id = app.ctx.uid
    local recipient_id = tonumber(app.params.with)

    if not recipient_id then error("user.not.exists", 0) end

    local conv_available = has_followed(recipient_id, sender_id)

    if not conv_available then error("conversation.unavailable", 0) end

    local conversation = get_conv_between(sender_id, recipient_id)

    if not conversation then
        conversation = new_conversation(sender_id, recipient_id)
    end

    return {json = conversation}
end

return create_conversation
