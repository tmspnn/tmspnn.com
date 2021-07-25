local PG = require "services.PG"
local redis_client = require "services.redis_client"
local has_value = require "util.has_value"
local fmt = string.format

--[[
    void is_conv_member(table options)
    boolean options.redirect
    string options.url
--]]

local function get_conv(conv_id)
    return PG.query([[
        select members from "conversation" where id = ?
    ]], conv_id)[1]
end

local function is_conv_member(options)
    local redirect = (options and options.redirect) or false
    local url = (options and options.url) or "/sign-in"

    return function(app)
        local function redirect_or_throw()
            if redirect then
                app:write({redirect_to = url})
            else
                error("not.authorized")
            end
        end

        local user_token = app.cookies.user_token

        if not user_token then redirect_or_throw() end

        local rds = redis_client:new()
        local uid = rds:run("get", fmt("user_token(%s):uid", user_token))
        uid = tonumber(uid)

        if not uid then redirect_or_throw() end

        local conv_id = tonumber(app.params.conversation_id)

        if not conv_id then redirect_or_throw() end

        local conv = get_conv(conv_id)

        if not conv then redirect_or_throw() end

        if not has_value(conv.members, uid) then redirect_or_throw() end
    end
end

return is_conv_member
