-- External modules
local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to

-- Local modules
local sign_in_required = require "middlewares.sign_in_required"
local sign_up = require "controllers.user_ctrl.sign_up"
local sign_in = require "controllers.user_ctrl.sign_in"
local send_vcode = require "controllers.user_ctrl.send_vcode"
local toggle_followship = require "controllers.user_ctrl.toggle_followship"

local function user_controller(app)
    app:post("/api/sign-up", json_params(sign_up))

    app:post("/api/sign-in", json_params(sign_in))

    app:post("/api/vcodes", json_params(send_vcode))

    app:match("/api/users/:user_id/followers", respond_to(
                  {before = sign_in_required(), PUT = toggle_followship}))
end

return user_controller
