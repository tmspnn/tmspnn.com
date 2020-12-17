-- Local modules
local util = require "util"
local controller = {}

-- As a base class, __index points to self
controller.__index = controller

function controller:new()
    local ctrl = {
        -- routes: array<{ method: string, path: string, handler: function }>
        routes = {}
    }
    return setmetatable(ctrl, self)
end

function controller:register(app)
    -- app: lapis.Application
    for _, route in ipairs(self.routes) do
        local method = util.lower_case(route.method)
        app[method](app, route.path, route.handler)
    end
end

return controller
