-- External
local web_sanitize = require "web_sanitize"

--
local User = require "models/user"
local Article = require "models/article"
local errors = require "models/error_messages"

local function update_article(app)
    local ctx = app.ctx
    local params = app.params
   
    if not ctx.uid then
        return errors["not.authorized"]
    end

    if #params.title == 0 or #params.title > 128 then
        return { status = 400, json = errors["title.length"] }
    end

    for _, w in ipairs(params.keywords) do
        if #w == 0 or #w > 64 then
            return { status = 400, json = errors["keyword.length"] }
        end
    end

    if #params.textContent == 0 or #params.textContent > 5e4 then
        return { status = 400, json = errors["content.length"] }
    end

    local user = User:find_by_id(ctx.uid)
    local sanitized_html = web_sanitize.sanitize_html(params.htmlContent)
    local article = Article:create({
        created_by = user.id,
        title = params.title,
        author = user.nickname,
        profile = user.profile,
        cover = params.cover,
        keywords = table.concat(params.keywords, ","),
        summary = string.sub(params.textContent, 1, 80),
        content = sanitized_html,
        status = params.isPublic and "public" or "" 
    })[1]

    return { json = article }
end

return update_article
