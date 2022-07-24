-- Must be called after app:enable("etlua")
local function render_component(name, data)
    local template_f = require("views.components." .. name)
    return template_f(data):render_to_string()
end

return render_component
