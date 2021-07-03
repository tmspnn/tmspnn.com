-- External modules
local ngx = require "ngx"
local basexx = require "basexx"
local escape = require("lapis.util").escape
local sha1 = require "sha1"

-- https://support.huaweicloud.com/api-obs/obs_04_0011.html
-- Resources: private/conversations/{conv_id}/{filename}
local function get_ops_signature(conv_id)
    local string_to_sign = table.concat({
        "GET", "", "", os.time() + 3600 * 6,
        "/oss.tmspnn.com/conversations/" .. conv_id
    }, "\n")

    local signature = escape(basexx.to_base64(
                                 sha1.hmac_binary(ngx.var.oss_secret_key,
                                                  string_to_sign)))

    return signature
end

return get_ops_signature
