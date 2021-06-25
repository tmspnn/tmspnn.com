-- External modules
local cjson = require "cjson"
local date = require "date"
local db = require "lapis.db"

-- Aliases
local fmt = string.format

-- Local modules
local Model = require "models.Model"
local push = require "util.push"
local remove = require "util.remove"

-- Implementation
local Conversation = Model:new("conversation")

local MAX_INT = 2147483647

-- @param {unsigned int} conv_id
-- @param {unsigned int} start_id
function Conversation:get_messages(conv_id, start_id)
    return self:query([[
        select * from "message"
        where conversation_id = ? and id < ?
        order by id desc limit 20
    ]], conv_id, start_id or MAX_INT)
end

-- @param {unsigned int} conv_id
-- @param {table} message
-- @param {unsigned int} message.conversation_id
-- @param {unsigned int} message.sender_id
-- @param {string} message.type
-- @param {string} message.text
-- @param {string} message.file
-- @param {table} message.string
-- @param {unsigned int} message.timestamp
function Conversation:appendMessage(conv_id, message)
    local obj = db.raw(fmt("'%s'::jsonb", message.data))

    return self:query([[
        insert into message
            (created_by, conversation_id, "type", "text", obj)
        values
            (?, ?, ?, ?, ?)
        returning *;
    ]], message.sender_id, conv_id, message.type, message.text, obj)[1]
end

-- @param {unsigned int} uid
-- @param {unsigned int[]} members
function Conversation:get_profiles(uid, members)
    local is_group_conv = #members > 2

    remove(members, uid)

    local user_ids = {}

    for _, v in pairs(members) do push(user_ids, v) end

    user_ids = is_group_conv and
                   {
            user_ids[#user_ids - 2], user_ids[#user_ids - 1],
            user_ids[#user_ids]
        } or user_ids

    return self:query([[
        select profile from "user" where id in ?
    ]], db.list(user_ids))
end

-- @param {unsigned int} conv_id
function Conversation:get_last_message(conv_id)
    return self:query([[
        select * from "message" where conversation_id = ?
        order by id desc limit 1
    ]], conv_id)[1]
end

return Conversation