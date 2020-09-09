-- Local module
local CORS = {}

-- Trust subdomains
CORS.trusted_origin_patterns = {"\\.tmspnn.com$"}

function CORS.add_headers_if_necessary(self)
    local origin = self.req.headers.origin
    local http_method = self.req.cmd_mth

    if origin == nil then
        return
    end

    for i, pattern in ipairs(CORS.trusted_origin_patterns) do
        if string.match(origin, pattern) ~= nil then
            self.res.headers["access-control-allow-origin"] = origin
            self.res.headers["access-control-allow-credentials"] = true
            if http_method == "OPTIONS" then
                self.res.headers["access-control-allow-methods"] = "GET,POST,PUT,POST"
                self.res.headers["access-control-allow-headers"] = "x-requested-with,content-type"
                self.res.headers["access-control-max-age"] = 60 * 60 * 24 * 7 * 4 -- 4 weeks
                self:write({
                    status = 204
                })
            end
            break
        end
    end
end

return CORS
