-- External modules
-- > The Nginx interface provided by OpenResty
local ngx = require "ngx"

-- Implementation
local function device(app)
    app.ctx.device = {
        os = nil,
        is_mobile = false
    }

    local ua = app.req.headers["user-agent"]

    if string.match(ua, "iPhone") or string.match(ua, "iPad") then
        app.ctx.device.os = "iOS"
        app.ctx.device.is_mobile = true
    elseif string.match(ua, "Android") ~= nil then
        app.ctx.device.os = "Android"
        app.ctx.device.is_mobile = true
    elseif string.match(ua, "Windows NT") ~= nil then
        app.ctx.device.os = "Windows"
        app.ctx.device.is_mobile = false
    elseif string.match(ua, "Macintosh") ~= nil then
        app.ctx.device.os = "Mac OS"
        app.ctx.device.is_mobile = false
    elseif string.match(ua, "X11") ~= nil then
        app.ctx.device.os = "Linux"
        app.ctx.device.is_mobile = false
    end
end

return device
