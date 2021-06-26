-- Local modules and aliases
local PG = require "services.PG"
local has_value = require "util.has_value"
local tags = require "util.tags"

local function get_conversation(conv_id)
    return PG.query([[
        select * from "conversation" where id = ?
    ]], conv_id)[1]
end

local function get_messages(conv_id)
    return PG:query([[
        select * from "message"
        where conversation_id = ?
        order by id desc limit 20
    ]], conv_id)
end

local function conversation(app)
    local ctx = app.ctx
    local conv_id = tonumber(app.params.conversation_id)
    local conv = get_conversation(conv_id)

    if not has_value(conv.members, ctx.uid) then error("forbidden", 0) end

    conv.messages = get_messages(conv_id)

    ctx.data = {uid = ctx.uid, conversation = conv}

    ctx.page_title = conversation.title .. " | 一刻阅读"
    ctx.tags_in_head = {tags:css("conversation")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("conversation")}

    return {render = "pages.conversation"}
end

return conversation
