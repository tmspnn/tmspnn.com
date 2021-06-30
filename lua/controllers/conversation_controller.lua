-- External modules
local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to

-- Local modules
local create_conversation =
    require "controllers.conversation_ctrl.create_conversation"
local send_message = require "controllers.conversation_ctrl.send_message"
local get_conversation =
    require "controllers.conversation_ctrl.get_conversation"
local sign_in_required = require "util.sign_in_required"

local function conversation_controller(app)
    app:match("/api/conversations", respond_to({
        before = sign_in_required(),
        POST = json_params(create_conversation)
    }))

    app:match("/api/conversations/:conversation_id/messages", respond_to(
                  {
            before = sign_in_required(),
            POST = json_params(send_message)
        }))

    app:match("/api/conversations/:conversation_id",
              respond_to({before = sign_in_required(), GET = get_conversation}))
end

return conversation_controller
