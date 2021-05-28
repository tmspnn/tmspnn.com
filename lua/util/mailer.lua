-- External modules
-- Nginx interface provided by OpenResty
local ngx = require "ngx"
local mail = require "resty.mail"

local mailer, err = mail.new({
    host = ngx.var.customer_service_mail_host,
    port = 25,
    starttls = true,
    username = ngx.var.customer_service_mail,
    password = ngx.var.customer_service_mail_password
})

if err then
    ngx.log(ngx.ERR, "ERROR: mail.new, ", err)
    ngx.exit(ngx.HTTP_INTERNAL_SERVER_ERROR)
end

return mailer
