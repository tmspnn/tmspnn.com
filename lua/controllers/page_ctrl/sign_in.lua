-- Local modules and aliases
local tags = require "util.tags"

local function sign_in(app)
    local ctx = app.ctx

    ctx.data = {}

    ctx.page_title = "一刻阅读 | 登录"
    ctx.tags_in_head = {tags:css("signIn")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("signIn")}

    return {render = "pages.sign_in"}
end

return sign_in
