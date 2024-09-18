local ngx = require "ngx"
local basexx = require "basexx"
local cjson = require "cjson"
local date = require "date"
local sha1 = require "sha1"

-- https://support.huaweicloud.com/api-obs/obs_04_0012.html
-- Resources: private/conversations/{conv_id}/{filename}
local function get_conv_oss_token(conv_id)
    local current_date = date()
    local expiration_date = current_date:adddays(1)
    local oss_policy = cjson.encode({
        expiration = expiration_date:fmt("${iso}Z"),
        conditions = {
            {["x-obs-acl"] = "private"}, {["bucket"] = "tmspnn"},
            {"starts-with", "$key", "private/conversations/" .. conv_id},
            {"starts-with", "$Content-Type", ""},
            {"starts-with", "$Cache-Control", ""}
        }
    })
    local string_to_sign = basexx.to_base64(oss_policy)
    local signature = basexx.to_base64(sha1.hmac_binary(ngx.var.oss_secret_key,
                                                        string_to_sign))
    return string_to_sign, signature
end

return get_conv_oss_token
