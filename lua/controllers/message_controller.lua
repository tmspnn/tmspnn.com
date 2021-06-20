-- External modules
local cjson = require "cjson"
local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to

-- Aliases
local fmt = string.format

-- Local modules
local Conversation = require "models.Conversation"
local each = require "util.each"
local extend = require "util.extend"
local redis_client = require "models.redis_client"
local sign_in_required = require "util.sign_in_required"
local User = require "models.User"

-- Implementation
local function create_conversation(app)
    local sender_id = app.ctx.uid
    local recipient_id = tonumber(app.params.with)

    if not recipient_id then error("user.not.exists", 0) end

    local conversation = User:find_conversation_between(sender_id, recipient_id)

    if not conversation then
        conversation = User:new_conversation(sender_id, recipient_id)
    end

    return {json = conversation}
end

local function send_message(app)
    local sender_id = app.ctx.uid

    local sender = User:find_by_id(sender_id)

    if not sender then error("user.not.exists", 0) end

    local conversation_id = tonumber(app.params.conversation_id)

    if not conversation_id then error("conversation.not.exists", 0) end

    local conv = Conversation:find_by_id(conversation_id)

    if not conv then error("conversation.not.exists", 0) end

    local data = {
        conversation_id = conversation_id,
        sender_id = sender_id,
        type = app.params.type or "text",
        text = app.params.text or "",
        file = app.params.file or "",
        data = cjson.encode(extend(app.params.data or {},
                                   {profile = sender.profile})),
        timestamp = os.time()
    }

    local msg = Conversation:appendMessage(conversation_id, data)
    local msg_str = cjson.encode(msg)

    local client = redis_client:new()

    local res = client:run("eval", [[
        local res = {}
        for _, v in ipairs(ARGV) do
            res[#res + 1] = redis.call("publish",
                string.format("uid(%s):inbox", v), KEYS[1])
        end
        return res
    ]], 1, msg_str, unpack(conv.members))

    each(res, function(ok, idx)
        if ok ~= 1 then
            -- Add to offline message
            User:offline_message(conv.members[idx], msg_str)
        end
    end)

    return {status = 204}
end

local function message_controller(app)
    app:match("/api/conversations", respond_to({
        before = sign_in_required({redirect = false}),
        POST = json_params(create_conversation)
    }))

    app:match("/api/conversations/:conversation_id/messages", respond_to({
        before = sign_in_required({redirect = false}),
        POST = json_params(send_message)
    }))
end

return message_controller
