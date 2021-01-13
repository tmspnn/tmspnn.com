local Article = require "models/article"
local User = require "models/user"
local util = require "util"

local function editor_data(app)
    local uid = app.ctx.uid
    local article_id = tonumber(app.params.article_id)

    if not uid then
        local from_url = "/editor"

        if article_id then
            from_url = from_url .. "?article_id=" .. article_id
        end

        return {redirect_to = "/sign-in?from=" .. app.ctx.escape(from_url)}
    end

    if not article_id then
        local policy, signature = User:generate_oss_upload_token(uid)

        return {
            page_name = "editor",
            page_title = "拾刻阅读 | 编辑",
            user = {id = uid},
            article = {},
            oss_policy = policy,
            oss_signature = signature
        }
    end

    local article = Article:find_by_id(article_id)

    if uid ~= article.created_by then
        return {status = 403, json = {err = "Not Authorized."}}
    end

    article.keywords = util.split(article.keywords, ",")

    local policy, signature = User:generate_oss_upload_token(uid)

    return {
        page_name = "editor",
        page_title = "拾刻阅读 | 编辑",
        user = {id = uid},
        article = article,
        oss_policy = policy,
        oss_signature = signature
    }
end

return editor_data
