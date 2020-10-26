local device = {
    os = nil,
    is_mobile = false
}

function device.detect(app)
    local ua = app.req.headers["user-agent"]
    if string.match(ua, "iPhone") ~= nil or string.match(ua, "iPad") ~= nil then
        device.os = "iOS"
        device.is_mobile = true
    elseif string.match(ua, "Android") ~= nil then
        device.os = "Android"
        device.is_mobile = true
    elseif string.match(ua, "Windows NT") ~= nil then
        device.os = "Windows"
        device.is_mobile = false
    elseif string.match(ua, "Macintosh") ~= nil then
        device.os = "Mac OS"
        device.is_mobile = false
    elseif string.match(ua, "X11") ~= nil then
        device.os = "Linux"
        device.is_mobile = false
    end
    app.device = device
end

return device
