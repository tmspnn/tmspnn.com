local to_json = require("lapis.util").to_json
local util = require("./util")
local user_controller = require("./controllers/user_controller")

local page_controller = {}

local css_path = ""
local js_path = ""
local version = "1.0.0"

local function handle_page(page, get_page_data)
    -- page: lapis.Application
    -- get_page_data: function(): table {
    --   page_name,
    --   js_path,
    --   version,
    --   page_title?,
    --   tags_in_head?
    -- }
    local page_data = get_page_data(page)
    local page_name_in_camel_case = util.camel_case(page_data.page_name)
    page.version = version
    page.css_path = css_path
    page.js_path = js_path
    page.page_data = page_data
    page.page_data_json_str = to_json(page_data)
    page.page_name = page_name_in_camel_case
    page.page_title = page_data.page_title
    page.tags_in_head = {{
        tag = "link",
        attributes = {
            type = "text/css",
            rel = "stylesheet",
            href = css_path .. "/" .. page.page_name .. "-" .. version .. ".css"
        }
    }}
    return {
        render = "pages." .. page_data.page_name
    }
end

local function get_page_data_index(app)
    local user_name = user_controller.get_user_name_by_token(app.cookies.token)
    return {
        page_name = "index",
        page_title = "title for index.html",
        user_name = user_name
    }
end

local function get_page_data_sign_in(app)
    local user_name = user_controller.get_user_name_by_token(app.cookies.token)
    return {
        page_name = "sign_in",
        page_title = "title for signIn.html",
        user_name = user_name
    }
end

function page_controller.setVersion(v)
    -- v: string
    version = v
end

function page_controller.bind(app)
    app:get("/", function(self)
        return handle_page(self, get_page_data_index)
    end)

    app:get("/sign-in", function(self)
        return handle_page(self, get_page_data_sign_in)
    end)
end

return page_controller
