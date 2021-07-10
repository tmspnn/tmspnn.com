local ngx = require "ngx"
local cjson = require "cjson"
local db = require "lapis.db"
--
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local each = require "util.each"
local push = require "util.push"
local get_oss_auth_key = require "util.get_oss_auth_key"
--
local fmt = string.format
--
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

local function create_message(m) return PG.create("message", m)[1] end

local function offline_message(msg, members)
    return PG.query([[
        update "user" set inbox = array_append(inbox, ?) where id in ?
    ]], msg, db.list(members))
end

local function update_conv(premature, conv_id, msg)
    return PG.query([[
        update conversation
        set
            obj = jsonb_set(obj, '{latest_message}', '"?"'),
            updated_at = now()
        where id = ?
    ]], db.raw(cjson.encode(msg)), conv_id)
end

local function send_message(app)
    local ctx = app.ctx
    local user = assert(get_user(ctx.uid), "user.not.exists")
    local conversation_id = tonumber(app.params.conversation_id)
    local conv = assert(get_conv(conversation_id), "conversation.not.exists")

    local m = {
        conversation_id = conversation_id,
        created_by = user.id,
        nickname = user.nickname,
        profile = user.profile,
        type = tonumber(app.params.type) or 0,
        text = app.params.text or "",
        file = app.params.file or "",
        obj = db.raw(fmt("'%s'::jsonb", cjson.encode(app.params.data or {})))
    }

    local msg = create_message(m)

    if msg.type ~= 0 then msg.auth_key = get_oss_auth_key(msg.file) end

    local json = cjson.encode(msg)

    local client = redis_client:new()
    local res = client:run("eval", [[
        local res = {}
        for _, v in ipairs(ARGV) do
            res[#res + 1] = redis.call("publish",
                string.format("uid(%s):inbox", v), KEYS[1])
        end
        return res
    ]], 1, json, unpack(conv.members))

    local offline_members = {}
    each(res, function(ok, idx)
        if ok ~= 1 then push(offline_members, conv.members[idx]) end
    end)

    if #offline_members > 0 then offline_message(json, offline_members) end

    ngx.timer.at(0, update_conv, conversation_id, msg)

    return {status = 204}
end

return send_message
