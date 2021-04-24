-- External modules
local to_json = require("lapis.util").to_json
local json_params = require("lapis.application").json_params

-- Aliases
local fmt = string.format

-- Local modules
local render_component = require "controllers/page/render_component"

-- Implementation
local assets_prefix = ""
local version = "1.0.0"

local function css_tag(page_name)
    return {
        tag = "link",
        attributes = {
            type = "text/css",
            rel = "stylesheet",
            href = fmt("%s/%s-%s.css", assets_prefix, page_name, version)
        }
    }
end

local function js_tag(page_name)
    return {
        tag = "script",
        attributes = {
            type = "text/javascript",
            src = fmt("%s/%s-%s.js", assets_prefix, page_name, version)
        }
    }
end

local function json_tag(data)
    return {
        tag = "script",
        attributes = {
            type = "application/json"
        },
        inner_html = to_json(data)
    }
end

local function page_controller(app)
    app:get("/", function(app)
        local ctx = app.ctx

        ctx.page_title = "一刻阅读 | 首页"
        ctx.tags_in_head = {css_tag("index")}
        ctx.tags_in_body = {json_tag({
            testing = true,
            xxx = "xxx"
        }), js_tag("index")}
        ctx.data = {
            testing = true
        }

        return {
            render = "pages.index"
        }
    end)
end

-- page_ctrl.css_path = ""
-- page_ctrl.js_path = ""
-- page_ctrl.version = "1.0.0"

-- local function get_meta_data(app, data_source)
--     local data = data_source(app)

--     if data.redirect_to or data.status then
--         return data
--     end

--     local css_url = page_ctrl.css_path .. "/" .. util.camel_case(data.page_name) .. "-" .. page_ctrl.version .. ".css"
--     local css_tag = {
--         tag = "link",
--         attributes = {
--             type = "text/css",
--             rel = "stylesheet",
--             href = css_url
--         }
--     }

--     if not data.tags_in_head then
--         data.tags_in_head = {css_tag}
--     else
--         util.push_back(data.tags_in_head, css_tag)
--     end

--     local js_url = page_ctrl.js_path .. "/" .. util.camel_case(data.page_name) .. "-" .. page_ctrl.version .. ".js"
--     local js_tag = {
--         tag = "script",
--         attributes = {
--             src = js_url
--         }
--     }

--     if not data.tags_in_body then
--         data.tags_in_body = {js_tag}
--     else
--         util.push_back(data.tags_in_body, js_tag)
--     end

--     util.assign(app.ctx, {
--         page_name = data.page_name,
--         page_title = data.page_title,
--         tags_in_head = data.tags_in_head,
--         tags_in_body = data.tags_in_body,
--         data = data,
--         data_json = to_json(data)
--     })

--     return {
--         render = "pages." .. data.page_name
--     }
-- end

-- util.push_back(page_ctrl.routes, {
--     method = "get",
--     path = "/",
--     handler = function(app)
--         return {
--             json = {
--                 testing = true
--             }
--         }
--         -- return get_meta_data(app, index_data)
--     end
-- }, {
--     method = "get",
--     path = "/editor",
--     handler = function(app)
--         return get_meta_data(app, editor_data)
--     end
-- }, {
--     method = "get",
--     path = "/sign-in",
--     handler = function(app)
--         return get_meta_data(app, sign_in_data)
--     end
-- }, {
--     method = "get",
--     path = "/sign-up",
--     handler = function(app)
--         return get_meta_data(app, sign_up_data)
--     end
-- }, {
--     method = "get",
--     path = "/forgot-password",
--     handler = function(app)
--         return get_meta_data(app, forgot_password_data)
--     end
-- }, {
--     method = "get",
--     path = "/reset-password",
--     handler = function(app)
--         return get_meta_data(app, reset_password_data)
--     end
-- }, {
--     method = "get",
--     path = "/articles/:article_id",
--     handler = function(app)
--         return get_meta_data(app, article_data)
--     end
-- }, {
--     method = "post",
--     path = "/components/:component_name",
--     handler = json_params(render_component)
-- }, {
--     method = "get",
--     path = "/followings",
--     handler = function(app)
--         return get_meta_data(app, followings_data)
--     end
-- }, {
--     method = "get",
--     path = "/followers",
--     handler = function(app)
--         return get_meta_data(app, followers_data)
--     end
-- }, {
--     method = "get",
--     path = "/messages",
--     handler = function(app)
--         return get_meta_data(app, messages_data)
--     end
-- }, {
--     method = "get",
--     path = "/users/:user_id",
--     handler = function(app)
--         return get_meta_data(app, user_data)
--     end
-- })

return page_controller
