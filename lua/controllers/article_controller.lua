local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to
--
local sign_in_required = require "middlewares.sign_in_required"
local create_article = require "controllers.article_ctrl.create_article"
local rate_article = require "controllers.article_ctrl.rate_article"
local create_comment = require "controllers.article_ctrl.create_comment"
local advocate_comment = require "controllers.article_ctrl.advocate_comment"
local report_abuse = require "controllers.article_ctrl.report_abuse"

local function article_controller(app)
    app:match("/api/articles", respond_to(
                  {
            before = sign_in_required(),
            POST = json_params(create_article)
        }))

    app:match("/api/ratings", respond_to(
                  {
            before = sign_in_required(),
            POST = json_params(rate_article)
        }))

    app:match("/api/articles/:article_id/comments", respond_to(
                  {
            before = sign_in_required(),
            POST = json_params(create_comment)
        }))

    app:match("/api/comments/:comment_id/advocators", respond_to(
                  {
            before = sign_in_required(),
            PUT = json_params(advocate_comment)
        }))

    app:match("/api/abuse-reports", respond_to(
                  {
            before = sign_in_required(),
            POST = json_params(report_abuse)
        }))
end

return article_controller
