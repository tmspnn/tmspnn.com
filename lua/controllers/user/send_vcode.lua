-- @External
local validation = require "resty.validation"

-- @Local
local User = require "models/user"
local mailer = require "controllers/user/mailer"
local errors = require "models/error_messages"

-- @Implementation
local function send_vcode(app)
    local ctx = app.ctx
    local email = ctx.trim(app.params.email)

    local is_email, _ = validation.email(email)

    if not is_email then
        return {status = 400, json = {err = errors["email.invalid"]}}
    end

    local existed_vcode = User:get_vcode(email)

    if existed_vcode then
        return {status = 403, json = {err = errors["vcode.not.available"]}}
    end

    local vcode = string.sub(math.random(), -4)

    User:set_vcode(vcode, email)

    local ok, err = mailer:send({
        from = "拾刻阅读 <tmspnn@163.com>",
        to = {email},
        cc = {},
        subject = "验证码:" .. vcode .. " | 拾刻阅读",
        text = vcode,
        html = string.format("<h1>%s</h1>", vcode)
    })

    if not ok then
        User:remove_vcode(email)
        return {status = 500, json = {err = err}}
    end

    return {status = 204}
end

return send_vcode
