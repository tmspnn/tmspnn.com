-- External modules
local cjson = require "cjson"
local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to

-- Aliases
local fmt = string.format

-- Local modules
local User = require "models.User"
local redis_client = require "models.redis_client"
local sign_in_required = require "util.sign_in_required"

-- Implementation
local function create_conversation(app)
    local sender_id = app.ctx.uid
    local recipient_id = tonumber(app.params.with)

    if not recipient_id then error("user.not.exists", 0) end

    local conversation = User:new_conversation(sender_id, recipient_id)

    return {json = conversation}
end

local function message_controller(app)
    app:post("/api/conversations", respond_to({
        before = sign_in_required({redirect = false}),
        POST = json_params(create_conversation)
    }))
end

return message_controller
