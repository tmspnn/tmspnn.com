local ngx = require "ngx"
local cjson = require "cjson"
local db = require "lapis.db"
local uuid = require "resty.jit-uuid"
uuid.seed()
--
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local each = require "util.each"
local push = require "util.push"
local get_oss_auth_key = require "util.get_oss_auth_key"
local fmt = string.format

local function get_user(uid)
    return PG.query([[
        select id, nickname, profile from "user" where id = ?
    ]], uid)[1]
end

local function get_conv(conv_id)
    return PG.query([[
        select * from "conversation" where id = ?
    ]], conv_id)[1]
end

local function broadcast(json_str, members)
    local client = redis_client:new()
    return client:run("eval", [[
        local res = {}
        for _, v in ipairs(ARGV) do
            res[#res + 1] = redis.call("publish",
                string.format("uid(%s):inbox", v), KEYS[1])
        end
        return res
    ]], 1, json_str, unpack(members))
end

local function write_messages()
    local client = redis_client:new()
    local messages = {}

    repeat
        messages = client:run("eval", [[
            local res = {}
            for i = 1, 100 do
                local msg = redis.call("lpop", "messages")
                if msg == nil then
                    break
                end
                res[#res + 1] = msg
            end
            return res
        ]])

        local escaped_message_strings = map(messages, function(str)
            local m = cjson.decode(escaped_messages)
            each(m, function(v, k)
                m[k] = db.escape_literal(v)
            end)
            return fmt("(%s, %d, %d, %s, %s, %d, %s, %s)", m.uuid, m.conversation_id, m.created_by, m.nickname,
                m.profile, m.type, m.text, m.file)
        end)

        local values_str = table.concat(escaped_message_strings, ",")

        PG.query([[
            insert into "message"
                (uuid, conversation_id, created_by, nickname, profile, type,
                    text, file)
            values
        ]] .. values_str)
    until (#messages == 0)

    client:run("del", "writing_messages")
end

local function persistent(premature, offline_members, msg_str)
    if #offline_members > 0 then
        PG.query([[
            update "user" set inbox = array_append(inbox, ?) where id in ?;
        ]], msg_str, db.list(members))
    end

    local client = redis_client:new()
    client:run("rpush", "messages", msg_str)
    local idle = client:run("sexnx", "writing_messages", 1)

    if idle == 1 then
        write_messages()
    end
end

local function send_message(app)
    local user = assert(get_user(app.ctx.uid), "user.not.exists")
    local conv_id = assert(tonumber(app.params.conversation_id), "conversation.not.exists")
    local conv = assert(get_conv(conversation_id), "conversation.not.exists")

    local m = {
        uuid = uuid(),
        conversation_id = conversation_id,
        created_by = user.id,
        nickname = user.nickname,
        profile = user.profile,
        type = tonumber(app.params.type) or 0,
        text = app.params.text or "",
        file = app.params.file or "",
        auth_key = app.params.type == 0 and "" or get_oss_auth_key(app.params.file)
    }

    local json = cjson.encode(m)
    local broadcast_res = broadcast(json, conv.members)
    local offline_members = {}

    each(broadcast_res, function(ok, idx)
        if ok ~= 1 then
            push(offline_members, conv.members[idx])
        end
    end)
    m.auth_key = nil

    ngx.timer.at(0, persistent, offline_members, cjson.encode(m))

    return {
        status = 204
    }
end

return send_message
