local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to
--
local is_self = require "middlewares.is_self"
local sign_in_required = require "middlewares.sign_in_required"
local sign_up = require "controllers.user_ctrl.sign_up"
local sign_in = require "controllers.user_ctrl.sign_in"
local send_vcode = require "controllers.user_ctrl.send_vcode"
local toggle_followship = require "controllers.user_ctrl.toggle_followship"
local get_auth_key = require "controllers.user_ctrl.get_auth_key"
local update_user = require "controllers.user_ctrl.update_user"
local get_author = require "controllers.user_ctrl.get_author"
local get_feeds = require "controllers.user_ctrl.get_feeds"

local function user_controller(app)
    local sign_in_filter = sign_in_required {
        redirect = false
    }

    app:get("/api/authors/:author_id", get_author)
    app:post("/api/sign-up", json_params(sign_up))
    app:post("/api/sign-in", json_params(sign_in))
    app:post("/api/vcodes", json_params(send_vcode))
    app:match("/api/users/:user_id/followers", respond_to({
        before = sign_in_filter,
        PUT = toggle_followship
    }))
    app:match("/api/users/:user_id/auth-keys", respond_to({
        before = is_self,
        GET = get_auth_key
    }))
    app:match("/api/users/:user_id", respond_to({
        before = is_self,
        PUT = json_params(update_user)
    }))
    app:match("/api/users/:user_id/feeds", respond_to({
        before = is_self,
        GET = get_feeds
    }))
end

return user_controller
