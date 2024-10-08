local ngx = require "ngx"
--
local trusted_origins = {"\\.tmspnn.com$"}
local max_age = 60 * 60 * 24 * 7 -- one week

local function CORS(app)
    local origin = app.req.headers.origin
    local http_method = app.req.cmd_mth

    if not origin then
        return
    end

    for _, pattern in ipairs(trusted_origins) do
        if string.match(origin, pattern) then
            app.res.headers["access-control-allow-origin"] = origin
            app.res.headers["access-control-allow-credentials"] = true
            if http_method == ngx.HTTP_OPTIONS then
                app.res.headers["access-control-allow-methods"] = "GET,POST,PUT"
                app.res.headers["access-control-allow-headers"] = "x-requested-with,content-type"
                app.res.headers["access-control-max-age"] = max_age
                app:write({
                    status = 204
                })
            end
            break
        end
    end
end

return CORS
