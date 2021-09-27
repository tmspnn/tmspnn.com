local PG = require "services.PG"
local redis_client = require "services.redis_client"
local at = require "util.at"
local has_value = require "util.has_value"
local fmt = string.format

local function get_conv(conv_id)
    --[[ int conv_id --]]
    return PG.query([[
        select members from "conversation" where id = ?;
    ]], conv_id)[1]
end

local function is_conv_member(app)
    --[[ lapis.Application app --]]
    local uid = app.ctx.uid

    if not uid then
        app:write{
            redirect_to = "/sign-in"
        }
    end

    local conv_id = assert(tonumber(app.params.conversation_id), "conversation.not.exists")
    local conv = assert(get_conv(conv_id), "conversation.not.exists")

    assert(has_value(conv.members, uid), "forbidden")
end

return is_conv_member
