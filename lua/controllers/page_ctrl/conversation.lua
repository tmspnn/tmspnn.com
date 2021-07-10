local PG = require "services.PG"
local each = require "util.each"
local get_conv_oss_token = require "util.get_conv_oss_token"
local has_value = require "util.has_value"
local reverse = require "util.reverse"
local tags = require "util.tags"
--
local function get_conversation(conv_id)
    return PG.query([[
        select
            id,
            created_by,
            members,
            title,
            obj->'meta_members' as meta_members
        from "conversation"
        where id = ?
    ]], conv_id)[1]
end

local function get_messages(conv_id)
    return PG.query([[
        select * from "message"
        where conversation_id = ?
        order by id desc limit 20
    ]], conv_id)
end

local function conversation(app)
    local ctx = app.ctx
    local conv_id = assert(tonumber(app.params.conversation_id),
                           "conversation.not.exists")
    local conv = assert(get_conversation(conv_id), "conversation.not.exists")
    assert(has_value(conv.members, ctx.uid), "forbidden")

    conv.messages = reverse(get_messages(conv_id))

    local policy, signature = get_conv_oss_token(conv_id)

    ctx.data = {
        uid = ctx.uid,
        conversation = conv,
        oss_policy = policy,
        oss_signature = signature
    }

    if conv.title == "" then
        --[[
            Title is empty string if there're only two members
            in the conversation
        --]]
        each(conv.meta_members, function(m)
            if m.id ~= ctx.uid then ctx.page_title = m.nickname end
        end)
    else
        ctx.page_title = conv.title
    end

    ctx.tags_in_head = {tags:css("conversation")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("conversation")}

    return {render = "pages.conversation"}
end

return conversation
