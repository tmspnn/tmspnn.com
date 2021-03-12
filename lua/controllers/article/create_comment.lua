-- External modules
local db = require("lapis.db")

-- Local modules
local Article = require("models/article")
local Comment = require("models/comment")
local User = require("models/user")
local util = require("util")

local function comment_article(app)
    local ctx = app.ctx
    local uid = ctx.uid
    local article_id = tonumber(app.params.article_id)
    local comment_content = ctx.trim(app.params.comment)
    local reference_id = tonumber(app.params.referenceId) or 0
    
    -- Authentication
    if not uid then return { redirect_to = "/sign-in" } end

    -- Input Validation
    if not article_id then error("article.not.exists", 0) end
    if #comment_content == 0 then error("empty.content", 0) end
    if #comment_content > 5000 then error("comment.too.long", 0) end
    
    -- Write into db
    local user = User:find_by_id(uid)
    local article = Article:find_by_id(article_id)
    local reference = nil

    if reference_id > 0 then
        reference = Comment:find_by_id(reference_id)
    end

    local comment = Comment:create({
        article_id = article_id,
        article_title = article.title,
        article_author = article.author,
        created_by = uid,
        author = user.nickname,
        profile = user.profile,
        content = comment_content,
        reference_id = reference_id,
        reference_content = reference and reference.content or "",
        reference_author = reference and reference.author or ""
    })

    Article:update({
        comments_count = db.raw("comments_count + 1"),
        updated_at = db.raw("now()")
    }, "id = ?", article_id)



    Comment:regularize(comment)

    -- Dynamic rendering, must be required locally
    local comment_template_fun = require("views/components/comment")
    local template = comment_template_fun({ data = comment })
    comment.html = template:render_to_string()

    return { json = comment }
end

return comment_article
