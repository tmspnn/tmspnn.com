-- External modules
local web_sanitize = require("web_sanitize")
local Sanitizer = require("web_sanitize.html").Sanitizer
local whitelist = require("web_sanitize.whitelist")

local w_list = whitelist:clone()

w_list.tags.figure = {
    ["data-trix-attachment"] = true,
    ["data-trix-content-type"] = true,
    ["data-trix-attributes"] = true,
    class = true
}
w_list.tags.figcaption = { class = true }
w_list.tags.img = { width = false, height = false }
w_list.tags.del = { class = true }

local sanitize_html = Sanitizer({ whitelist = w_list })

-- Local modules
local User = require "models/user"
local Article = require "models/article"
local errors = require "models/error_messages"

local function create_article(app)
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

    local user = User:find_by_id(ctx.uid)
    local sanitized_html = sanitize_html(params.html)
    local texts = web_sanitize.extract_text(sanitized_html)

    if #texts < 100 then
        return { status = 400, json = errors["content.length"] }
    end
   
    local summary = string.sub(web_sanitize.extract_text(sanitized_html), 1, 80)

    local article = Article:create({
        created_by = user.id,
        title = params.title,
        author = user.nickname,
        profile = user.profile,
        cover = params.cover,
        keywords = table.concat(params.keywords, ","),
        summary = summary,
        content = sanitized_html,
        status = params.isPublic and "public" or "" 
    })[1]

    return { json = article }
end

return create_article
