-- Local modules and aliases
local PG = require "services.PG"
local get_oss_token = require "util.get_oss_token"
local tags = require "util.tags"

local function editor(app)
    local ctx = app.ctx
    local policy, signature = get_oss_token(ctx.uid)

    ctx.data = {uid = ctx.uid, oss_policy = policy, oss_signature = signature}

    ctx.page_title = "一刻阅读 | 编辑"
    ctx.tags_in_head = {tags:css("editor")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("editor")}

    return {render = "pages.editor"}
end

return editor
