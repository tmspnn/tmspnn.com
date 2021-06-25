-- External modules
local cjson = require "cjson"
local respond_to = require("lapis.application").respond_to

-- Aliases
local fmt = string.format

-- Local modules
local index = require "controllers.page_ctrl.index"
local empty = require "util.empty"

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

local function trending(app)
    local ctx = app.ctx
    local articles_7d = Article:get_hot_articles_7d()
    local authors_7d = User:get_hot_authors_7d()
    ctx.data = {articles_7d = articles_7d, authors_7d = authors_7d}
    ctx.page_title = "一刻阅读 | 排行"
    ctx.tags_in_head = {css_tag("trending")}
    ctx.tags_in_body = {json_tag(ctx.data), js_tag("trending")}
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
    if ctx.uid then
        advocated_comments = User:get_advocated_comments(ctx.uid, article_id)
    end

    if not empty(advocated_comments) then
        for _, comment in ipairs(comments) do
            for _, c in ipairs(advocated_comments) do
                if c.comment_id == comment.id then
                    comment.advocated = true
                end
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

local function conversations(app)
    local ctx = app.ctx
    ctx.data = {}
    ctx.page_title = "一刻阅读 | 消息"
    ctx.tags_in_head = {css_tag("conversations")}
    ctx.tags_in_body = {json_tag(ctx.data), js_tag("conversations")}
    return {render = "pages.conversations"}
end

local function me(app)
    local ctx = app.ctx
    local user = User:find_by_id(ctx.uid)
    local ratings_count = User:get_ratings_count(user.id)
    user.ratings_count = ratings_count
    local articles = Article:get_by_author(user.id)
    ctx.data = {uid = ctx.uid, user = user, articles = articles}
    ctx.page_title = "一刻阅读 | 我的"
    ctx.tags_in_head = {css_tag("me")}
    ctx.tags_in_body = {json_tag(ctx.data), js_tag("me")}
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

local function author(app)
    local author_id = tonumber(app.params.author_id)
    if not author_id then return {render = "pages.404"} end
    local author = User:find_by_id(author_id)
    local has_followed = not empty(
                             User:filter_followed(app.ctx.uid, {author_id}))
    local ratings_count = User:get_ratings_count(author_id)
    author.ratings_count = ratings_count
    local articles = Article:get_by_author(author_id)
    local ctx = app.ctx
    ctx.data = {
        uid = ctx.uid,
        author = author,
        has_followed = has_followed,
        articles = articles
    }
    ctx.page_title = author.nickname .. " | 一刻阅读"
    ctx.tags_in_head = {css_tag("author")}
    ctx.tags_in_body = {json_tag(ctx.data), js_tag("author")}
    return {render = "pages.author"}
end

local function conversation(app)
    local conversation_id = tonumber(app.params.conversation_id)
    local conversation = Conversation:find_by_id(conversation_id)
    conversation.messages = Conversation:get_messages(conversation_id)
    conversation.members = User:get_by_ids(conversation.members)
    local ctx = app.ctx
    ctx.data = {uid = ctx.uid, conversation = conversation}
    ctx.page_title = conversation.title .. " | 一刻阅读"
    ctx.tags_in_head = {css_tag("conversation")}
    ctx.tags_in_body = {json_tag(ctx.data), js_tag("conversation")}
    return {render = "pages.conversation"}
end

local function page_controller(app)
    app:get("/", index)
    app:get("/articles/:article_id", article)
    app:get("/trending", trending)
    app:get("/conversations", conversations)
    app:match("/me", respond_to({before = sign_in_required, GET = me}))
    app:get("/sign-in", sign_in)
    app:get("/sign-up", sign_up)
    app:match("/editor", respond_to({before = sign_in_required, GET = editor}))
    app:match("/comment-editor",
              respond_to({before = sign_in_required, GET = comment_editor}))
    app:get("/users/:author_id", author)
    app:match("/conversations/:conversation_id",
              respond_to({before = sign_in_required, GET = conversation}))
end

return page_controller
