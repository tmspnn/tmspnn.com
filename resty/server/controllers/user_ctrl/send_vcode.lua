-- Local modules
local redis_client = require "services.redis_client"
local is_mobile = require "util.is_mobile"
local trim = require "util.trim"
local fmt = string.format
local sub = string.sub

-- Constants
local VCODE_TTL = 60 * 10 -- ten minutes

local function get_vcode(mobile)
    local client = redis_client:new()
    return client:run("get", fmt("mobile(%s):vcode", mobile))
end

local function set_vcode(vcode, mobile)
    local client = redis_client:new()
    client:run("setex", fmt("mobile(%s):vcode", mobile), VCODE_TTL, vcode)
end

local function send_vcode(app)
    local mobile = trim(app.params.mobile)

    if not is_mobile(mobile) then error("mobile.invalid", 0) end

    local existed_vcode = get_vcode(mobile)

    if existed_vcode then error("vcode.not.available", 0) end

    local vcode = sub(math.random(), -4)

    set_vcode(vcode, mobile)

    return {json = {mobile = mobile, vcode = vcode}}
end

return send_vcode
