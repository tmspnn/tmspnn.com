-- Local module
local CORS = {}

-- Trust subdomains
CORS.trusted_origin_patterns = {"\\.tmspnn.com$"}

function CORS.add_headers_if_necessary(app)
    local origin = app.req.headers.origin
    local http_method = app.req.cmd_mth

    if origin == nil then
        return
    end

    for i, pattern in ipairs(CORS.trusted_origin_patterns) do
        if string.match(origin, pattern) ~= nil then
            app.res.headers["access-control-allow-origin"] = origin
            app.res.headers["access-control-allow-credentials"] = true
            if http_method == "OPTIONS" then
                app.res.headers["access-control-allow-methods"] = "GET,POST,PUT,POST"
                app.res.headers["access-control-allow-headers"] = "x-requested-with,content-type"
                app.res.headers["access-control-max-age"] = 60 * 60 * 24 * 7 * 4 -- 4 weeks
                app:write({
                    status = 204
                })
            end
            break
        end
    end
end

return CORS
