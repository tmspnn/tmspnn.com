-- External modules
local lapis_application = require "lapis.application"
local json_params = lapis_application.json_params

-- Local modules
local util = require "util"
local controller = require "controllers/controller"
local sign_in = require "controllers/user/sign_in"
local send_vcode = require "controllers/user/send_vcode"
local sign_up = require "controllers/user/sign_up"
local retrieve_password = require "controllers/user/retrieve_password"
local reset_password = require "controllers/user/reset_password"

-- Initialization
local user_ctrl = controller:new()

util.push_back(user_ctrl.routes, {
    method = "post",
    path = "/api/sign-in",
    handler = json_params(sign_in)
}, {
    method = "post",
    path = "/api/verification-codes",
    handler = json_params(send_vcode)
}, {
    method = "post",
    path = "/api/sign-up",
    handler = json_params(sign_up)
}, {
    method = "post",
    path = "/api/retrieve-password",
    handler = json_params(retrieve_password)
}, {
    method = "post",
    path = "/api/reset-password",
    handler = json_params(reset_password)
})

return user_ctrl
