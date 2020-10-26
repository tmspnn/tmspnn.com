local ngx = require("ngx")
local basexx = require("basexx")
local date = require("date")
local sha1 = require("sha1")
local to_json = require("lapis.util").to_json
local user_controller = {}

-- @returns user_name: nil | string
function user_controller.get_user_name_by_token(token)
    if token == nil then
        return nil
    end

    return nil
end

-- uid: int
-- @returns policy: string
-- @returns signature: string
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
        }, {"starts-with", "$key", "users/" .. uid}}
    })
    local string_to_sign = basexx.to_base64(oss_policy)
    local signature = basexx.to_base64(sha1.hmac(ngx.var.oss_secret_key, string_to_sign))
    return string_to_sign, signature
end

return user_controller
