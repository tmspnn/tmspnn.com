-- External modules
local bcrypt = require "bcrypt"
local validation = require "resty.validation"
local uuid = require "resty.jit-uuid"
uuid.seed()

-- Local modules
local User = require "models/user"

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

    local is_email, _ = validation.email(email)

    if not is_email then
        res.status = 400
        res.json.err = "请输入合法的邮箱地址."
        return res
    end

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

    User:set_token(user_token, user.id)
    
    app.cookies.user_token = user_token

    res.status = 204
    
    return res
end

return sign_in