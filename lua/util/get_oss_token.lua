local ngx = require "ngx"
local basexx = require "basexx"
local cjson = require "cjson"
local date = require "date"
local sha1 = require "sha1"

local function get_oss_token(uid)
    local current_date = date()
    local expiration_date = current_date:adddays(1)
    local oss_policy = cjson.encode({
        expiration = expiration_date:fmt("${iso}Z"),
        conditions = {
            {["x-obs-acl"] = "public-read"}, {["bucket"] = "tmspnn"},
            {"starts-with", "$key", "public/users/" .. uid},
            {"starts-with", "$Content-Type", ""},
            {"starts-with", "$Cache-Control", ""}
        }
    })
    local string_to_sign = basexx.to_base64(oss_policy)
    local signature = basexx.to_base64(sha1.hmac_binary(ngx.var.oss_secret_key,
                                                        string_to_sign))
    return string_to_sign, signature
end

return get_oss_token
