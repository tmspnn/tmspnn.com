local Article = require "models/article"
local User = require "models/user"
local util = require "util"

local function comment_article(app)
    local ctx = app.ctx
    local article_id = tonumber(app.params.articleId)
    local comment_content = tonumber(app.params.comment)

    local res = {
        status = nil,
        json = {
            err = nil
        }
    }

    if not ctx.uid then
        return {
            redirect_to = "/sign-in?from=" .. ctx.escape("/articles/" .. article_id)
        }
    end

    -- TODO: check inputs & handle exceptions

    local current_user = User:find_by_id(ctx.uid)
    local current_article = Article:find_by_id(article_id)

    local comment = {
        article_id = article_id,
        article_title = current_article.title,
        article_author = current_article.author,
        created_by = ctx.uid,
        author = current_user.nickname,
        profile = current_user.profile,
        content = comment_content
    }

    local pg_res = Article:create_comment(comment)

    res.json = pg_res
    return res
end

return comment_article
