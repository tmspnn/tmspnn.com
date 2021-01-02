-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty

-- Local module
local exception = {}

function exception.handle_404()
    return {
        status = 404,
        render = "pages.404"
    }
end

function exception.handle_error(app, err, trace)
    -- app: lapis.Application
    -- err: string
    -- trace: string
    ngx.log(ngx.ERR, err, trace)
end

return exception
