-- Local modules
local PG = require "services.PG"
local get_oss_token = require "util.get_oss_token"
local tags = require "util.tags"

local function comment_editor(app)
    local ctx = app.ctx
    local policy, signature = get_oss_token(ctx.uid)

    ctx.data = {
        uid = ctx.uid,
        oss_policy = policy,
        oss_signature = signature,
        article_id = app.params.article_id,
        refer_to = app.params.refer_to
    }

    ctx.page_title = "一刻阅读 | 评论"
    ctx.tags_in_head = {tags:css("commentEditor")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("commentEditor")}

    return {render = "pages.comment_editor"}
end

return comment_editor
