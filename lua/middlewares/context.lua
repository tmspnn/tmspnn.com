-- Local modules
local User = require "models.User"

-- Implementation
local function context(app)
    local ctx = {
        os = "Unknown",
        is_mobile = false,
        uid = nil,
        uuid = app.cookies.uuid,
        user_token = app.cookies.user_token
    }
    local ua = app.req.headers["user-agent"]

    if type(ua) == "string" then
        if string.match(ua, "iPhone") or string.match(ua, "iPad") then
            ctx.os = "iOS"
            ctx.is_mobile = true
        elseif string.match(ua, "Android") then
            ctx.os = "Android"
            ctx.is_mobile = true
        elseif string.match(ua, "Windows NT") then
            ctx.os = "Windows"
            ctx.is_mobile = false
        elseif string.match(ua, "Macintosh") then
            ctx.os = "Mac OS"
            ctx.is_mobile = false
        elseif string.match(ua, "X11") then
            ctx.os = "Linux"
            ctx.is_mobile = false
        end
    end

    if ctx.user_token then ctx.uid = User:get_id_by_token(ctx.user_token) end

    app.ctx = ctx
end

return context
