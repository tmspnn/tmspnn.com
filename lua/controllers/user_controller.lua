-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local basexx = require "basexx"
local bcrypt = require "bcrypt"
local log_rounds = 9
local date = require "date"
local sha1 = require "sha1"
local lapis_util = require "lapis.util"
local lapis_application = require "lapis.application"
local json_params = lapis_application.json_params
local to_json = lapis_util.to_json
local uuid = require "resty.jit-uuid"
uuid.seed()

-- Local modules
local util = require "util"
local controller = require "controllers/controller"
local User = require "models/user"

-- Initialization
local user_ctrl = controller:new()

local function generate_oss_upload_token(uid)
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

local function sign_in(app)
    local email = app.params.email
    local password = app.params.password
    local res = {
        status = nil,
        json = {
            err = nil,
            user = nil
        }
    }

    local user = User:find("id, email, password from \"user\" where email = ?", email)[1]

    if not user then
        res.status = 400
        res.json.err = "此邮箱还未注册."
        return res
    end

    if not bcrypt.verify(password, user.password) then
        res.status = 400
        res.json.err = "密码与账号不匹配."
        return res
    end

    local user_token = uuid()
    app.cookies.user_token = user_token
    User:set_token(user_token, user.id)

    res.status = 206
    return res
end

util.push_back(user_ctrl.routes, {
    method = "post",
    path = "/api/sign-in",
    handler = json_params(sign_in)
})

return user_ctrl
