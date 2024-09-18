local ngx = require "ngx"
local md5 = require "md5"
local floor = math.floor
local random = math.random

-- https://support.huaweicloud.com/usermanual-cdn/cdn_01_0040.html
local function get_oss_auth_key(pathname)
    local filename = pathname:sub(1, 1) == "/" and pathname or "/" .. pathname
    local timestamp = os.time()
    local random_number = floor(1e4 * random())
    local uid = 0
    local private_key = ngx.var.oss_auth_key
    local hash = md5.sumhexa(filename .. "-" .. timestamp .. "-" .. random_number .. "-" .. uid .. "-" .. private_key)
    return timestamp .. "-" .. random_number .. "-" .. uid .. "-" .. hash
end

return get_oss_auth_key
