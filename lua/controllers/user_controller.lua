-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local basexx = require "basexx"
local date = require "date"
local sha1 = require "sha1"
local lapis_util = require "lapis.util"
local to_json = lapis_util.to_json

-- Local modules
local controller = require "controllers/controller"

-- Initialization
local user_controller = controller:new()

function user_controller.generate_oss_upload_token(uid)
    -- https://support.huaweicloud.com/api-obs/obs_04_0012.html
    local current_date = date()
    local expiration_date = current_date:adddays(1)
    local oss_policy = to_json({
        expiration = expiration_date:fmt("${iso}Z"),
        conditions = {{
            ["x-obs-acl"] = "public-read"
        }, {
            ["bucket"] = "tmspnn"
        }, {"starts-with", "$key", "public/users/" .. uid}, {"starts-with", "$Content-Type", ""}}
    })
    local string_to_sign = basexx.to_base64(oss_policy)
    local signature = basexx.to_base64(sha1.hmac_binary(ngx.var.oss_secret_key, string_to_sign))
    return string_to_sign, signature
end

return user_controller
