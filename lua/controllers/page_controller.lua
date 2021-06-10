-- External modules
local cjson = require "cjson"
local respond_to = require("lapis.application").respond_to

-- Aliases
local fmt = string.format

-- Local modules
-- local render_component = require "controllers/page/render_component"
local Article = require "models.Article"
local has_value = require "util.has_value"
local User = require "models.User"

-- Faked data for testing
local faked_trending = require "faked_data.faked_trending"
local faked_messages = require "faked_data.faked_messages"
local faked_me = require "faked_data.faked_me"

-- Implementation
local assets_prefix = ""
local version = "1.0.0"

local function css_tag(filename)
    return {
        tag = "link",
        attributes = {
            type = "text/css",
            rel = "stylesheet",
            href = fmt("%s/%s-%s.css", assets_prefix, filename, version)
        }
    }
end

local function js_tag(filename)
    return {
        tag = "script",
        attributes = {
            type = "text/javascript",
            src = fmt("%s/%s-%s.js", assets_prefix, filename, version)
        }
    }
end

local function json_tag(data)
    return {
        tag = "script",
        attributes = {type = "application/json"},
        inner_html = cjson.encode(data)
    }
end

local function sign_in_required(app)
    if not app.ctx.uid then app:write({redirect_to = "/sign-in"}) end
end

local function index(app)
    local ctx = app.ctx
    local search_placeholder = Article:get_search_placeholder()
    local recommended_tags = Article:get_recommended_tags()
    local latest_articles = Article:get_latest()
    ctx.data = {
        uid = ctx.uid,
        search_placeholder = search_placeholder,
        recommended_tags = recommended_tags,
        latest_articles = latest_articles
    }
    ctx.page_title = "一刻阅读 | 首页"
    ctx.tags_in_head = {css_tag("index")}
    ctx.tags_in_body = {json_tag(ctx.data), js_tag("index")}
    return {render = "pages.index"}
end

local function trending(app)
    local ctx = app.ctx
    ctx.page_title = "一刻阅读 | 排行"
    ctx.tags_in_head = {css_tag("trending")}
    ctx.tags_in_body = {json_tag(faked_trending), js_tag("trending")}
    ctx.data = faked_trending

    return {render = "pages.trending"}
end

local function article(app)
    local ctx = app.ctx
    local article_id = tonumber(app.params.article_id)
    local article = Article:find_by_id(article_id)

    if not article then return {render = "pages.404"} end

    article.blocks = cjson.decode(article.content).blocks

    local comments = Article:get_comments_by_article_id(article_id)

    local advocated_comments
    if ctx.uid then advocated_comments = User:get_advocated_comments(ctx.uid) end

    if #advocated_comments then
        for _, comment in ipairs(comments) do
            if has_value(advocated_comments, comment.id) then
                comment.advocated = true
            end
        end
    end

    local related_articles = Article:get_related(article_id)
    local my_rating

    if ctx.uid then my_rating = Article:get_rating(ctx.uid, article_id) end

    ctx.page_title = article.title
    ctx.data = {
        article = article,
        comments = comments,
        related_articles = related_articles,
        my_rating = my_rating
    }
    ctx.tags_in_head = {css_tag("article")}
    ctx.tags_in_body = {json_tag(ctx.data), js_tag("article")}

    return {render = "pages.article"}
end

local function messages(app)
    local ctx = app.ctx
    ctx.page_title = "一刻阅读 | 消息"
    ctx.tags_in_head = {css_tag("messages")}
    ctx.tags_in_body = {json_tag(faked_messages), js_tag("messages")}
    ctx.data = faked_messages

    return {render = "pages.messages"}
end

local function me(app)
    local ctx = app.ctx
    ctx.page_title = "一刻阅读 | 我的"
    ctx.tags_in_head = {css_tag("me")}
    ctx.tags_in_body = {json_tag(faked_messages), js_tag("me")}
    ctx.data = faked_me

    return {render = "pages.me"}
end

local function sign_in(app)
    local ctx = app.ctx
    ctx.page_title = "一刻阅读 | 登录"
    ctx.tags_in_head = {css_tag("signIn")}
    ctx.tags_in_body = {json_tag({}), js_tag("signIn")}
    ctx.data = {}

    return {render = "pages.sign_in"}
end

local function sign_up(app)
    local ctx = app.ctx
    ctx.page_title = "一刻阅读 | 登录"
    ctx.tags_in_head = {css_tag("signUp")}
    ctx.tags_in_body = {json_tag({}), js_tag("signUp")}
    ctx.data = {}

    return {render = "pages.sign_up"}
end

local function editor(app)
    local ctx = app.ctx
    local policy, signature = User:generate_oss_upload_token(ctx.uid)

    ctx.page_title = "一刻阅读 | 编辑"
    ctx.tags_in_head = {css_tag("editor")}
    ctx.tags_in_body = {
        json_tag({
            user_id = ctx.uid,
            oss_policy = policy,
            oss_signature = signature
        }), js_tag("editor")
    }
    ctx.data = {}

    return {render = "pages.editor"}
end

local function comment_editor(app)
    local ctx = app.ctx
    local policy, signature = User:generate_oss_upload_token(ctx.uid)

    ctx.data = {
        user_id = ctx.uid,
        article_id = app.params.article_id,
        refer_to = app.params.refer_to,
        oss_policy = policy,
        oss_signature = signature
    }
    ctx.page_title = "一刻阅读 | 发表评论"
    ctx.tags_in_head = {css_tag("commentEditor")}
    ctx.tags_in_body = {json_tag(ctx.data), js_tag("commentEditor")}

    return {render = "pages.comment_editor"}
end

local function page_controller(app)
    app:get("/", index)
    app:get("/articles/:article_id", article)
    app:get("/trending", trending)
    app:get("/messages", messages)
    app:match("/me", respond_to({before = sign_in_required, GET = me}))
    app:get("/sign-in", sign_in)
    app:get("/sign-up", sign_up)
    app:get("/editor", respond_to({before = sign_in_required, GET = editor}))
    app:get("/comment-editor",
            respond_to({before = sign_in_required, GET = comment_editor}))
end

return page_controller
