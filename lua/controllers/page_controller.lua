-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local date = require "date"
local lapis_util = require "lapis.util"
local to_json = lapis_util.to_json

-- Local modules
local util = require "util"
local controller = require "controllers/controller"

-- Initialization
local page_ctrl = controller:new()

util.assign(page_ctrl, {
    css_path = "",
    js_path = "",
    version = "1.0.0"
})

local function get_meta_data(app, data_source)
    local data = data_source(app)

    if data.redirect_to then
        return data
    end

    local css_url = page_ctrl.css_path .. "/" .. util.camel_case(data.page_name) .. "-" .. page_ctrl.version .. ".css"
    local css_tag = {
        tag = "link",
        attributes = {
            type = "text/css",
            rel = "stylesheet",
            href = css_url
        }
    }

    if not data.tags_in_head then
        data.tags_in_head = {css_tag}
    else
        util.push_back(data.tags_in_head, css_tag)
    end

    local js_url = page_ctrl.js_path .. "/" .. util.camel_case(data.page_name) .. "-" .. page_ctrl.version .. ".js"
    local js_tag = {
        tag = "script",
        attributes = {
            src = js_url
        }
    }

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

    return {
        render = "pages." .. data.page_name
    }
end

local function index_data_source(app)
    -- local feeds = {}

    -- for i = 1, 10 do
    --     table.insert(feeds, {
    --         id = nil,
    --         uid = nil,
    --         title = "这是一个Feed的测试标题",
    --         cover = "https://oss.tmspnn.com/public/WechatIMG30.jpeg",
    --         author = "tmspnn",
    --         profile = nil,
    --         created_at = date(2020, 6, 4, 14, 52):fmt("%Y/%m/%d %I:%M"),
    --         updated_at = date(2020, 10, 4, 9, 18):fmt("%Y/%m/%d %I:%M"),
    --         tags = {"随笔", "编程"},
    --         pageview = 213,
    --         score = 7.2,
    --         summary = "The summary of the article",
    --         content = "a lot of html ... content ..."
    --     })
    -- end

    return {
        page_name = "index",
        page_title = "title for index.html",
        feeds = {}
    }
end

util.push_back(page_ctrl.routes, {
    method = "get",
    path = "/",
    handler = function(app)
        return get_meta_data(app, index_data_source)
    end
}, {
    method = "post",
    path = "",
    handler = nil
}, {
    method = "post",
    path = "",
    handler = nil
})

return page_ctrl
