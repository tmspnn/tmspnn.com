-- @External
local validation = require "resty.validation"
local uuid = require "resty.jit-uuid"
uuid.seed()

-- @Local
local User = require "models/user"
local mailer = require "controllers/user/mailer"
local errors = require "models/error_messages"

local function retrieve_password(app)
    local ctx = app.ctx
    local email = ctx.trim(app.params.email)

    local is_email, _ = validation.email(email)

    if not is_email then
        return {status = 400, json = {err = errors["email.invalid"]}}
    end

    local user = User:find("* from \"user\" where email = ?", email)[1]

    if not user then
        return {status = 400, json = {err = errors["email.not.registered"]}}
    end

    local existed_sequence = User:get_password_sequence(email)

    if existed_sequence then
        return {
            status = 403,
            json = {err = errors["password.reset.not.available"]}
        }
    end

    local sequence = uuid()

    User:set_password_sequence(sequence, email)

    local reset_link =
        "https://tmspnn.com/reset-password?sequence=" .. sequence .. "&email=" ..
            ctx.escape(email)

    local ok, err = mailer:send({
        from = "拾刻阅读 <tmspnn@163.com>",
        to = {email},
        cc = {},
        subject = "重置密码 | 拾刻阅读",
        text = reset_link,
        html = string.format('<a href="%s">%s</h1>', reset_link, reset_link)
    })

    if not ok then
        User:remove_password_sequence(sequence)
        return {status = 500, json = {err = err}}
    end

    return {status = 204}
end

return retrieve_password
