local Article = require "models/article"
local User = require "models/user"
local util = require "util"

local function article_data_source(app)
    local uid = app.ctx.uid
    local article_id = tonumber(app.params.article_id)

    local res = {
        status = nil,
        json = {
            err = nil,
            article = nil
        }
    }

    if not article_id then
        res.status = 400
        res.json.err = "无效的文章id"
        return res
    end

    local article = Article:find_by_id(article_id)

    article.keywords = util.split(article.keywords, ",")

    return {
        page_name = "article",
        page_title = "拾刻阅读 | " .. article.title,
        user = {
            id = uid
        },
        article = article
    }
end

return article_data_source
