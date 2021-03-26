-- External modules
local ngx = require("ngx")
local date = require("date")

-- Local modules
local User = require("models/user")
local Article = require("models/article")
local Comment = require("models/comment")
local util = require("util")

local function article_data(app)
    local uid = app.ctx.uid
    local article_id = tonumber(app.params.article_id)

    if not article_id then error("article.not.exists", 0) end

    local article = Article:find_by_id(article_id)

    if not article then error("article.not.exists", 0) end

    Article:regularize(article)

    local my_rating = Article:get_rating_by_uid(article_id, uid)

    local comments = Comment:find([[
    * from "comment" where article_id = ? order by id desc limit 20
    ]], article_id)

    local advocated_comments = {}

    if uid then 
        advocated_comments = User:check_advocated_comments(uid, util.map(comments, function (c) return c.id end))
    end

    for i, c in ipairs(comments) do
        Comment:regularize(c)
        c.advocated = advocated_comments[i] and (advocated_comments[i] ~= ngx.null)
    end

    local related_articles = Article:find([[
    * from "article" where created_by = ? and id <> ? order by id desc limit 10
    ]], article.created_by, article_id)

    for _, a in ipairs(related_articles) do
        Article:regularize(a)
    end

    return {
        page_name = "article",
        page_title = "拾刻阅读 | " .. article.title,
        user = { id = uid },
        article = article,
        comments = comments,
        x = type(comments),
        advocated_comments = advocated_comments,
        related_articles = related_articles,
        my_rating = my_rating
    }
end

return article_data
