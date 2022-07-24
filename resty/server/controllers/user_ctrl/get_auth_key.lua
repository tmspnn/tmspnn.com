local get_oss_auth_key = require "util.get_oss_auth_key"
local unescape = require "util.unescape"

local function get_auth_key(app)
    local ctx = app.ctx
    local uid = tonumber(app.params.user_id)

    if uid ~= ctx.uid then error("forbidden", 0) end

    local filepath = unescape(app.params.filepath)
    local auth_key = get_oss_auth_key(filepath)

    return {json = {auth_key = auth_key}}
end

return get_auth_key
