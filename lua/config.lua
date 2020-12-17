-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local config = require("lapis.config")

config("production", {
    secret = "tmspnn.com:openresty",
    logging = false,
    postgres = {
        host = ngx.var.redis_host,
        password = ngx.var.pg_password,
        database = "tmspnn"
    }
})
