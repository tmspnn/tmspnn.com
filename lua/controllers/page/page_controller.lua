-- @External modules
local lapis_util = require "lapis.util"
local to_json = lapis_util.to_json
local lapis_application = require "lapis.application"
local json_params = lapis_application.json_params

-- @Local modules
local controller = require "controllers/controller"
local util = require "util"
local index_data = require "controllers/page/index_data"
local editor_data = require "controllers/page/editor_data"
local sign_in_data = require "controllers/page/sign_in_data"
local sign_up_data = require "controllers/page/sign_up_data"
local forgot_password_data = require "controllers/page/forgot_password_data"
local reset_password_data = require "controllers/page/reset_password_data"
local article_data = require "controllers/page/article_data"
local me_data = require "controllers/page/me_data"
local followings_data = require "controllers/page/followings_data"
local followers_data = require "controllers/page/followers_data"
local messages_data = require "controllers/page/messages_data"
local render_component = require "controllers/page/render_component"

-- @Implementation
local page_ctrl = controller:new()

page_ctrl.css_path = ""
page_ctrl.js_path = ""
page_ctrl.version = "1.0.0"

local function get_meta_data(app, data_source)
    local data = data_source(app)

    if data.redirect_to or data.status then return data end

    local css_url =
        page_ctrl.css_path .. "/" .. util.camel_case(data.page_name) .. "-" ..
            page_ctrl.version .. ".css"
    local css_tag = {
        tag = "link",
        attributes = {type = "text/css", rel = "stylesheet", href = css_url}
    }

    if not data.tags_in_head then
        data.tags_in_head = {css_tag}
    else
        util.push_back(data.tags_in_head, css_tag)
    end

    local js_url =
        page_ctrl.js_path .. "/" .. util.camel_case(data.page_name) .. "-" ..
            page_ctrl.version .. ".js"
    local js_tag = {tag = "script", attributes = {src = js_url}}

    if not data.tags_in_body then
        data.tags_in_body = {js_tag}
    else
        util.push_back(data.tags_in_body, js_tag)
    end

    util.assign(app.ctx, {
        page_name = data.page_name,
        page_title = data.page_title,
        tags_in_head = data.tags_in_head,
        tags_in_body = data.tags_in_body,
        data = data,
        data_json = to_json(data)
    })

    return {render = "pages." .. data.page_name}
end

util.push_back(page_ctrl.routes, {
    method = "get",
    path = "/",
    handler = function(app) return get_meta_data(app, index_data) end
}, {
    method = "get",
    path = "/editor",
    handler = function(app) return get_meta_data(app, editor_data) end
}, {
    method = "get",
    path = "/sign-in",
    handler = function(app) return get_meta_data(app, sign_in_data) end
}, {
    method = "get",
    path = "/sign-up",
    handler = function(app) return get_meta_data(app, sign_up_data) end
}, {
    method = "get",
    path = "/forgot-password",
    handler = function(app) return get_meta_data(app, forgot_password_data) end
}, {
    method = "get",
    path = "/reset-password",
    handler = function(app) return get_meta_data(app, reset_password_data) end
}, {
    method = "get",
    path = "/articles/:article_id",
    handler = function(app) return get_meta_data(app, article_data) end
}, {
    method = "post",
    path = "/components/:component_name",
    handler = json_params(render_component)
}, {
    method = "get",
    path = "/me",
    handler = function(app) return get_meta_data(app, me_data) end
}, {
    method = "get",
    path = "/followings",
    handler = function(app) return get_meta_data(app, followings_data) end
}, {
    method = "get",
    path = "/followers",
    handler = function(app) return get_meta_data(app, followers_data) end
}, {
    method = "get",
    path = "/messages",
    handler = function(app) return get_meta_data(app, messages_data) end
})

return page_ctrl
