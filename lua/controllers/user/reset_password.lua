-- External modules
local bcrypt = require "bcrypt"
local log_rounds = 9
local validation = require "resty.validation"

-- Local modules
local User = require "models/user"

local function reset_password(app)
    local email = app.params.email
    local sequence = app.params.sequence
    local password = app.params.password

    local res = {
        status = nil,
        json = {
            err = nil
        }
    }

    local is_email, _ = validation.email(email)

    if not is_email then
        res.status = 400
        res.json.err = "请输入合法的邮箱地址."
        return res
    end

    local existed_sequence = User:get_password_sequence(email)

    if not existed_sequence or sequence ~= existed_sequence then
        res.status = 403
        res.json.err = "Forbidden."
        return res
    end

    local user = User:find("id from \"user\" where email = ?", email)[1]
    
    local digested_password = bcrypt.digest(password, log_rounds)

    User:update({password = digested_password}, "id = ?", user.id)

    res.status = 204

    return res
end

return reset_password