-- External modules
local bcrypt = require "bcrypt"
local log_rounds = 9
local validation = require "resty.validation"

-- Local modules
local User = require "models/user"

local function sign_up(app)
    local email = app.params.email
    local vcode = app.params.vcode
    local password = app.params.password

    local res = {
        status = nil,
        json = {
            err = nil,
            user = nil
        }
    }

    local is_email, _ = validation.email(email)

    if not is_email then
        res.status = 400
        res.json.err = "请输入合法的邮箱地址."
        return res
    end

    local existed_vcode = User:get_vcode(email)

    if vcode ~= existed_vcode then
        res.status = 400
        res.json.err = "验证码错误"
        return res
    end

    local digested_password = bcrypt.digest(password, log_rounds)
    local user = User:create({
        email = email,
        password = digested_password,
        nickname = "匿名" .. uuid()
    })

    res.json.user = user
    
    return res
end

return sign_up