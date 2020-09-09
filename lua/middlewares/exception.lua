-- The Nginx interface provided by OpenResty
local ngx = require("ngx")

-- Local module
local exception = {}

function exception.handle_404()
    return {
        status = 404,
        render = "pages.404"
    }
end

-- app: lapis.Application
-- err: string
-- trace: string
function exception.handle_error(app, err, trace)
    if (app.res.status == nil) then
        app.res.status = 500
    end

    ngx.log(ngx.ERR, err, "\r\n", trace)

    return {
        status = app.res.status,
        render = "pages.error"
    }
end

return exception
