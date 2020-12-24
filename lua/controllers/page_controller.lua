-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local date = require "date"
local lapis_util = require "lapis.util"
local to_json = lapis_util.to_json

-- Local modules
local util = require "util"
local controller = require "controllers/controller"
local Article = require "models/article"
local User = require "models/user"

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
    local uid = app.ctx.uid
    local latest_feeds = Article:get_latest()
    local latest_authors = User:get_recommended()
    local recommended_topics = Article:get_recommended_topics()

    for _, fd in ipairs(latest_feeds) do
        fd.created_at = date(fd.created_at):fmt("%Y/%m/%d %H:%M")
        fd.keywords = util.split(fd.keywords, ",")
    end

    return {
        page_name = "index",
        page_title = "拾刻阅读 | 首页",
        user = {
            id = uid
        },
        feeds = latest_feeds,
        recommended_authors = latest_authors,
        recommended_topics = recommended_topics
    }
end

local function editor_data_source(app)
    local uid = app.ctx.uid
    local article_id = app.params.article_id

    if not uid then
        local from_url = "/editor"

        if type(article_id) == "string" then
            from_url = from_url .. "?article_id=" .. article_id
        end

        return {
            redirect_to = "/sign-in?from=" .. app.ctx.escape(from_url)
        }
    end
    
    local article = Article.find_by_id(article_id)

    if uid ~= article.created_by then
        return {
            status = 403,
            err = "Not Authorized."
        }
    end

    return {
        user = {
            id = uid
        },
        article = article_id
    }
end

local function sign_in_data_source(app)
    return {
        page_name = "sign_in",
        page_title = "拾刻阅读 | 登录"
    }
end

util.push_back(page_ctrl.routes, {
    method = "get",
    path = "/",
    handler = function(app)
        return get_meta_data(app, index_data_source)
    end
}, {
    method = "get",
    path = "/editor",
    handler = function(app)
        return get_meta_data(app, editor_data_source)
    end
}, {
    method = "get",
    path = "/sign-in",
    handler = function(app)
        return get_meta_data(app, sign_in_data_source)
    end
})

return page_ctrl
