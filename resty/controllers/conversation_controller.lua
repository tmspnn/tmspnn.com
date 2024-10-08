local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to
--
local create_conversation = require "controllers.conversation_ctrl.create_conversation"
local send_message = require "controllers.conversation_ctrl.send_message"
local get_conversation = require "controllers.conversation_ctrl.get_conversation"
local sign_in_required = require "middlewares.sign_in_required"
local is_conv_member = require "middlewares.is_conv_member"

local function conversation_controller(app)
    local sign_in_filter = sign_in_required {
        redirect = false
    }
    local conv_member_filter = is_conv_member

    app:match("/api/conversations", respond_to({
        before = sign_in_filter,
        POST = json_params(create_conversation)
    }))

    app:match("/api/conversations/:conversation_id/messages", respond_to({
        before = conv_member_filter,
        POST = json_params(send_message)
    }))

    app:match("/api/conversations/:conversation_id", respond_to({
        before = conv_member_filter,
        GET = get_conversation
    }))
end

return conversation_controller
