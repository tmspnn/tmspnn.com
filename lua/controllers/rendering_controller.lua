local respond_to = require("lapis.application").respond_to
--
local sign_in_required = require "middlewares.sign_in_required"
local is_conv_member = require "middlewares.is_conv_member"
local index = require "controllers.rendering_ctrl.index"
local trending = require "controllers.rendering_ctrl.trending"
local article = require "controllers.rendering_ctrl.article"
local author = require "controllers.rendering_ctrl.author"
local conversations = require "controllers.rendering_ctrl.conversations"
local conversation = require "controllers.rendering_ctrl.conversation"
local me = require "controllers.rendering_ctrl.me"
local sign_in = require "controllers.rendering_ctrl.sign_in"
local sign_up = require "controllers.rendering_ctrl.sign_up"
local editor = require "controllers.rendering_ctrl.editor"
local comment_editor = require "controllers.rendering_ctrl.comment_editor"
local settings = require "controllers.rendering_ctrl.settings"
local tag = require "controllers.rendering_ctrl.tag"
local followings = require "controllers.rendering_ctrl.followings"
local followers = require "controllers.rendering_ctrl.followers"
local app_homepage = require "controllers.rendering_ctrl.app_homepage"

--[[
    void rendering_controller(lapis.Application app)
--]]

local function rendering_controller(app)
    -- L1 pages
    app:get("/", index)

    app:get("/trending", trending)

    app:match("/conversations", respond_to(
                  {
            before = sign_in_required({redirect = true}),
            GET = conversations
        }))

    app:match("/me", respond_to(
                  {before = sign_in_required({redirect = true}), GET = me}))

    app:get("/app", app_homepage)

    -- L2 pages
    app:get("/articles/:article_id", article)

    app:get("/users/:author_id", author)

    app:get("/tags/:tag_name", tag)

    app:get("/users/:user_id/followings", followings)
    app:get("/users/:user_id/followers", followers)

    app:match("/conversations/:conversation_id", respond_to(
                  {
            before = is_conv_member({redirect = true}),
            GET = conversation
        }))

    app:match("/editor", respond_to(
                  {before = sign_in_required({redirect = true}), GET = editor}))

    app:match("/settings", respond_to(
                  {before = sign_in_required({redirect = true}), GET = settings}))

    -- L3 pages
    app:get("/sign-in", sign_in)

    app:get("/sign-up", sign_up)

    app:match("/comment-editor", respond_to(
                  {
            before = sign_in_required({redirect = true}),
            GET = comment_editor
        }))
end

return rendering_controller
