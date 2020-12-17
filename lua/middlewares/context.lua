-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty

-- Local modules
local context = {}

function context.init(app)
    app.ctx = {}
end

return context
