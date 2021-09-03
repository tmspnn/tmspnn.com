local respond_to = require("lapis.application").respond_to
--
local sign_in_required = require "middlewares.sign_in_required"
local is_conv_member = require "middlewares.is_conv_member"
local index = require "controllers.page_ctrl.index"
local trending = require "controllers.page_ctrl.trending"
local article = require "controllers.page_ctrl.article"
local author = require "controllers.page_ctrl.author"
local conversations = require "controllers.page_ctrl.conversations"
local conversation = require "controllers.page_ctrl.conversation"
local me = require "controllers.page_ctrl.me"
local sign_in = require "controllers.page_ctrl.sign_in"
local sign_up = require "controllers.page_ctrl.sign_up"
local editor = require "controllers.page_ctrl.editor"
local comment_editor = require "controllers.page_ctrl.comment_editor"
local settings = require "controllers.page_ctrl.settings"
local tag = require "controllers.page_ctrl.tag"
local followings = require "controllers.page_ctrl.followings"
local followers = require "controllers.page_ctrl.followers"
local app_homepage = require "controllers.page_ctrl.app_homepage"

--[[
    void page_controller(lapis.Application app)
--]]

local function page_controller(app)
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

return page_controller
