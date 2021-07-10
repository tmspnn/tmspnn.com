local cjson = require "cjson"
local db = require "lapis.db"
--
local PG = require "services.PG"
--
local fmt = string.format

-- Has user a followed user b
local function has_followed(a, b)
    return PG.query([[
        select id from "interaction"
        where created_by = ? and refer_to = ? and type = 2
    ]], a, b)[1] ~= nil
end

local function get_conv_between(sender_id, recipient_id)
    return PG.query([[
        select
            id,
            created_by,
            members,
            title,
            muted_by,
            obj->'latest_message' as latest_message,
            updated_at
        from "conversation"
        where
            created_by in (?, ?) and
            array_length(members, 1) = 2 and
            members @> '{?, ?}'
    ]], sender_id, recipient_id, sender_id, recipient_id)[1]
end

local function get_users(user_ids)
    return PG.query([[
        select id, nickname, profile from "user" where id in ?
    ]], db.list(user_ids))
end

local function new_conversation(sender_id, recipient_id, title, obj)
    return PG.query([[
        insert into "conversation"
            (created_by, members, title, obj)
        values
            (?, ?, ?, ?::jsonb)
        returning
            id,
            created_by,
            members,
            title,
            muted_by,
            obj->'meta_members' as meta_members,
            obj->'latest_message' as latest_message,
            updated_at
    ]], sender_id, db.array({sender_id, recipient_id}), title, obj or "{}")[1]
end

local function create_conversation(app)
    local sender_id = app.ctx.uid
    local recipient_id = assert(tonumber(app.params.with), "user.not.exists")
    assert(has_followed(recipient_id, sender_id), "conversation.unavailable")

    local conversation = get_conv_between(sender_id, recipient_id)

    if not conversation then
        local users = get_users({sender_id, recipient_id})
        local sender, recipient = unpack(users)
        local obj = cjson.encode({meta_members = {sender, recipient}})
        conversation = new_conversation(sender_id, recipient_id, "", obj)
    end

    return {json = conversation}
end

return create_conversation
