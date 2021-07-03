-- External modules
local db = require "lapis.db"

-- Local modules
local PG = require "services.PG"
local push = require "util.push"
local reverse = require "util.reverse"

local function get_conv(conv_id)
    return PG.query([[
        select * from "conversation" where id = ?
    ]], conv_id)[1]
end

local function get_profiles(uid, members)
    local user_ids = {}
    local i = #members

    while i > 0 and #user_ids < 4 do
        if members[i] ~= uid then push(user_ids, members[i]) end
        i = i - 1
    end

    return PG.query([[
        select id, profile from "user" where id in ?
    ]], db.list(user_ids))
end

local function get_latest_messages(conv_id)
    return PG.query([[
        select * from "message"
        where conversation_id = ? order by id desc limit 20
    ]], conv_id)
end

local function get_conversation(app)
    local conv_id = tonumber(app.params.conversation_id)

    if not conv_id then error("conversation.not.exists", 0) end

    local conv = get_conv(conv_id)

    conv.profiles = get_profiles(app.ctx.uid, conv.members)

    conv.latest_messages = reverse(get_latest_messages(conv_id))

    return {json = conv}
end

return get_conversation
