-- External packages
local ngx = require "ngx" -- The Nginx interface provided by OpenResty

local function render_component(app)
    local component_name = app.params.component_name
    app.ctx.data = app.params.data

    return {
        content_type = "text/html; charset=utf-8",
        render = "components/" .. component_name,
        layout = "empty_layout"
    }
end

return render_component
