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
local follow_user = require "controllers/user/follow_user"
local unfollow_user = require "controllers/user/unfollow_user"
local update_user = require "controllers/user/update_user"

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
}, {method = "post", path = "/api/sign-up", handler = json_params(sign_up)}, {
    method = "post",
    path = "/api/retrieve-password",
    handler = json_params(retrieve_password)
}, {
    method = "post",
    path = "/api/reset-password",
    handler = json_params(reset_password)
}, {
    method = "post",
    path = "/api/users/:user_id/followers",
    handler = json_params(follow_user)
}, {
    method = "delete",
    path = "/api/users/:user_id/followers",
    handler = json_params(unfollow_user)
}, {
    method = "put",
    path = "/api/users/:user_id",
    handler = json_params(update_user)
})

return user_ctrl
