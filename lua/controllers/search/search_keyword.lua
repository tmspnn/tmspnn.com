-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local http = require "lapis.nginx.http"

local function search_keyword(app)
    local ctx = app.ctx
    local keyword = app.params.keyword
    local body, status_code, headers = http.simple(ngx.var.search_service_host .. "?" .. ctx.escape(keyword))

    if not body then
        ngx.log(ngx.ERR, status_code, headers)
        error("Search service error: " .. keyword)
    end

    return {
        status = status_code,
        json = body
    }
end

return search_keyword
