-- External modules
local cjson = require "cjson"
local db = require "lapis.db"

-- Local modules
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local each = require "util.each"
local push = require "util.push"
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

local function create_message(m) return PG.create("message", m)[1] end

local function offline_message(msg, members)
    return PG.query([[
        update "user" set inbox = array_append(inbox, ?) where id in ?
    ]], msg, db.list(members))
end

local function send_message(app)
    local user = get_user(app.ctx.uid)

    if not user then error("user.not.exists", 0) end

    local conversation_id = tonumber(app.params.conversation_id)
    local conv = get_conv(conversation_id)

    if not conv then error("conversation.not.exists", 0) end

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

    return {status = 204}
end

return send_message
