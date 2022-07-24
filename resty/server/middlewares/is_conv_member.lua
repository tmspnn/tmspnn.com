local PG = require "services.PG"
local redis_client = require "services.redis_client"
local at = require "util.at"
local has_value = require "util.has_value"
local fmt = string.format

local MEMBERS_CACHE_TTL = 60 * 60 * 24 -- 24 hours

local function get_conv(conv_id)
    --[[ int conv_id --]]
    return PG.query([[
        select members from "conversation" where id = ?;
    ]], conv_id)[1]
end

local function check_authority(uid, conv_id)
    local client = redis_client:new()
    local is_member = client:run("sismember", fmt("conv(%d):members", conv_id), tostring(uid))
    return is_member == 1
end

local function check_members_cache(conv_id)
    local client = redis_client:new()
    local typ = client:run("type", fmt("conv(%d):members", conv_id))
    return typ == "set"
end

local function set_members_cache(conv_id, members)
    local client = redis_client:new()
    client:run("sadd", fmt("conv(%d):members", conv_id), unpack(members))
    client:run("expire", fmt("conv(%d):members", conv_id), MEMBERS_CACHE_TTL)
end

local function is_conv_member(app)
    --[[ lapis.Application app --]]
    local uid = assert(app.ctx.uid, "sign_in.required")
    local conv_id = assert(tonumber(app.params.conversation_id), "conversation.not.exists")
    local members_cache_exists = check_members_cache(conv_id)

    if members_cache_exists then
        assert(check_authority(uid, conv_id), "forbidden")
    end

    local conv = assert(get_conv(conv_id), "conversation.not.exists")
    set_members_cache(conv_id, conv.members)
    assert(has_value(conv.members, uid), "forbidden")
end

return is_conv_member
