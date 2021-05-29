-- External modules
local bcrypt = require "bcrypt"
local json_params = require("lapis.application").json_params
local ngx = require "ngx"
local uuid = require "resty.jit-uuid"
local validation = require "resty.validation"

uuid.seed()

-- Local modules
local User = require "models/User"

local function send_email(options)
    -- local mailer, err = mail.new({
    --     host = ngx.var.customer_service_mail_host,
    --     port = 465,
    --     ssl = true,
    --     starttls = false,
    --     username = ngx.var.customer_service_mail,
    --     password = ngx.var.customer_service_mail_password
    -- })

    -- local mailer, err = mail.new({
    --     host = "smtp.163.com",
    --     port = 465,
    --     ssl = true,
    --     starttls = false,
    --     username = "tmspnn@163.com",
    --     password = "NFUILQRFIKUOVGXN"
    -- })

    -- if err then
    --     error(err, 0)
    -- end

    -- local ok, err = mailer:send({
    --     from = options.from or "一刻阅读 <tmspnn@gmail.com>",
    --     to = {options.email},
    --     cc = options.cc or {},
    --     subject = options.subject,
    --     text = options.text,
    --     html = options.html
    -- })

    -- local ok, err = mailer:send({
    --     from = "一刻阅读 <tmspnn@163.com>",
    --     to = {"tmspnn@163.com"},
    --     cc = {},
    --     subject = "验证码: " .. "1111",
    --     text = "1111",
    --     html = "<h1>1111</h1>"
    -- })

    -- if not ok then
    --     error(err)
    -- end
end

local function sign_in(app)
    local ctx = app.ctx
    ctx.trim_all(app.params)

    local mobile = app.params.email
    local password = app.params.password

    if not string.match(mobile, "1[34578]%d%d%d%d%d%d%d%d%d") then
        error("mobile.invalid", 0)
    end

    if #password < 6 then
        error("password.invalid", 0)
    end

    local user_in_db = User:find([[
        id, email, password from "user" where mobile = ?
    ]], mobile)[1]

    if not user_in_db then
        error("mobile.not.registered", 0)
    end

    if not bcrypt.verify(password, user_in_db.password) then
        error("password.not.match", 0)
    end

    local user_token = User:generate_user_token(user_in_db.id)
    User:set_token(user_token, user_in_db.id)
    app.cookies.user_token = user_token

    return {
        status = 204
    }
end

local function send_vcode(app)
    if true then
        local r, e = send_email()
        return {
            json = {
                r = r,
                e = e
            }
        }
    end

    local ctx = app.ctx
    ctx.trim_all(app.params)

    local email = app.params.email

    local is_email, _ = validation.email(email)

    if not is_email then
        error("email.invalid", 0)
    end

    local existed_vcode = User:get_vcode(email)

    if existed_vcode then
        error("vcode.not.available", 0)
    end

    local vcode = string.sub(math.random(), -4)

    User:set_vcode(vcode, email)

    return {
        status = 204
    }
end

local function user_controller(app)
    app:post("/api/sign-in", json_params(sign_in))
    app:post("/api/vcodes", json_params(send_vcode))
end

return user_controller
