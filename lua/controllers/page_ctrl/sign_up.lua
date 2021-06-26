-- Local modules and aliases
local tags = require "util.tags"

local function sign_up(app)
    local ctx = app.ctx

    ctx.data = {}

    ctx.page_title = "一刻阅读 | 登录"
    ctx.tags_in_head = {tags:css("signUp")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("signUp")}

    return {render = "pages.sign_up"}
end

return sign_up
