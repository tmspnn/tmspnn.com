local to_json = require("lapis.util").to_json
local user_controller = require("./controllers/user_controller")

local page_controller = {}

local css_path = ""
local js_path = ""
local version = "1.0.0"

-- @required page.page_data: table
local function set_page_attributes(page)
    page.version = version
    page.css_path = css_path
    page.js_path = js_path
    page.tags_in_head = {{
        tag = "link",
        attributes = {
            type = "text/css",
            rel = "stylesheet",
            href = css_path .. "/index-" .. version .. ".css"
        }
    }}
    page.page_data_json_str = to_json(page.page_data)
end

-- @required v: string
function page_controller.setVersion(v)
    version = v
end

function page_controller.bind(app)
    app:get("/", function(self)
        self.page_name = "index"
        local user_name = user_controller.get_user_name_by_token(self.cookies.token)
        self.page_data = {
            user_name = user_name,
            title = "page index"
        }
        set_page_attributes(self)
        return {
            render = "pages.index"
        }
    end)
end

return page_controller
