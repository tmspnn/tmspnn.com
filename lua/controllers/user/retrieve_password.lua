-- External modules
local validation = require "resty.validation"
local uuid = require "resty.jit-uuid"
uuid.seed()

-- Local modules
local mailer = require "controllers/user/mailer"

local function retrieve_password(app)
    local email = app.params.email

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

    local user = User:find("* from \"user\" where email = ?", email)[1]

    if not user then
        res.status = 400
        res.json.err = "此邮箱还未注册."
        return res
    end

    local existed_sequence = User:get_password_sequence(email)

    if existed_sequence then
        res.status = 429
        res.json.err = "重置密码邮件有效时间为一天, 此期间内请勿重复发送."
        return res
    end

    local sequence = uuid()

    User:set_password_sequence(sequence, email)

    local reset_link = "https://tmspnn.com/reset-password?sequence=" .. sequence .. "&email=" .. app.ctx.escape(email)

    local ok, err = mailer:send({
        from = "拾刻阅读 <tmspnn@163.com>",
        to = { email },
        cc = {},
        subject = "重置密码 | 拾刻阅读",
        text = reset_link,
        html = string.format('<a href="%s">%s</h1>', reset_link, reset_link)
    })

    if not ok then
        User:remove_password_sequence(sequence)
        res.status = 500
        res.json.err = err
        return res
    end

    res.status = 204
    
    return res
end

return retrieve_password