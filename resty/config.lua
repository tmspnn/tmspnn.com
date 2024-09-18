-- External modules
local ngx = require "ngx"
local config = require "lapis.config"

config("production", {
    secret = "tmspnn.com:openresty",
    logging = false,
    postgres = {
        host = ngx.var.pg_host,
        user = ngx.var.pg_user,
        password = ngx.var.pg_password,
        database = "tmspnn"
    }
})
