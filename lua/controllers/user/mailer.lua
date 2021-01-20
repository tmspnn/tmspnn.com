-- @External
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local mail = require "resty.mail"

local mailer, err = mail.new({
    host = ngx.var.customer_service_mail_host,
    port = 25,
    starttls = true,
    username = ngx.var.customer_service_mail,
    password = ngx.var.customer_service_mail_password
})

if err then
    ngx.log(ngx.ERR, "mail.new error: ", err)
    return ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

return mailer
