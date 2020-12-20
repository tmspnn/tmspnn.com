-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local lapis_util = require "lapis.util"

-- Local modules
local context = {}

function context.init(app)
    app.ctx = {
        escape = lapis_util.escape,
        snake_case = lapis_util.underscore,
        trim = lapis_util.trim,
        from_json = lapis_util.from_json,
        to_json = lapis_util.to_json
    }
end

return context
