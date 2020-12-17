-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty

-- Local modules
local cors = {}

local trusted_origins = {"\\.tmspnn.com$"}

function cors.add_headers_if_necessary(app)
    -- app: lapis.Application
    local origin = app.req.headers.origin
    local http_method = app.req.cmd_mth

    if not origin then
        return
    end

    for i, pattern in ipairs(trusted_origins) do
        if string.match(origin, pattern) then
            app.res.headers["access-control-allow-origin"] = origin
            app.res.headers["access-control-allow-credentials"] = true
            if http_method == ngx.HTTP_OPTIONS then
                app.res.headers["access-control-allow-methods"] = "GET,POST,PUT,POST"
                app.res.headers["access-control-allow-headers"] = "x-requested-with,content-type"
                app.res.headers["access-control-max-age"] = 60 * 60 * 24 * 7 -- one week
                app:write({
                    status = 204
                })
            end
            break
        end
    end
end

return cors
