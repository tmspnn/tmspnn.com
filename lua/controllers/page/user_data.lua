-- External modules
local ngx = require("ngx")

-- Local modules
local User = require("models/user")
local util = require("util")

-- Implementation
local function user_data(app)
    local uid = app.ctx.uid
    local user_id = tonumber(app.params.user_id)

    if not user_id then error("user.not.exists", 0) end

    local user = User:find_by_id(user_id)

    if not user then error("user.not.exists", 0) end

    return {
        page_name = "user",
        page_title = "一刻阅读 | " .. user.nickname,
        uid = uid,
        user = user,
        events = {},
        followings = {},
        followers = {}
    }
end

return user_data
