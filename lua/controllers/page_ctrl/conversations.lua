-- Local modules and aliases
local tags = require "util.tags"

local function conversations(app)
    local ctx = app.ctx

    ctx.data = {}
    ctx.page_title = "一刻阅读 | 消息"
    ctx.tags_in_head = {tags:css("conversations")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("conversations")}

    return {render = "pages.conversations"}
end

return conversations
