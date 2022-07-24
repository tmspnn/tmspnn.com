local redis_client = require "services.redis_client"
local fmt = string.format

local function get_uid_by_token(user_token)
    --[[ string user_token --]]
    local client = redis_client:new()
    local uid = client:run("get", fmt("user_token(%s):uid", user_token))
    return tonumber(uid)
end

local function context(app)
    --[[ lapis.Application app --]]
    app.ctx = {}
    local user_token = app.cookies.user_token

    if user_token then
        app.ctx.uid = get_uid_by_token(user_token)
    end
end

return context
