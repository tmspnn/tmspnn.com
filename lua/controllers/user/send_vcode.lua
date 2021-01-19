-- @External
local validation = require "resty.validation"

-- @Local
local mailer = require "controllers/user/mailer"
local User = require "models/user"

local function send_vcode(app)
    local email = app.params.email
    local is_email, _ = validation.email(email)

    local res = {status = nil, json = {err = nil}}

    if not is_email then
        res.status = 400
        res.json.err = "请输入合法的邮箱地址."
        return res
    end

    local existed_vcode = User:get_vcode(email)

    if existed_vcode then
        res.status = 429
        res.json.err =
            "验证码有效时间为10分钟, 此期间内请勿重复发送."
        return res
    end

    local vcode = string.sub(math.random(), -4)

    User:set_vcode(vcode, email)

    local ok, err = mailer:send({
        from = "拾刻阅读 <tmspnn@163.com>",
        to = {email},
        cc = {},
        subject = "验证码 | 拾刻阅读",
        text = vcode,
        html = string.format("<h1>%s</h1>", vcode)
    })

    if not ok then
        User:remove_vcode(email)
        res.status = 500
        res.json.err = err
        return res
    end

    res.status = 204

    return res
end

return send_vcode
