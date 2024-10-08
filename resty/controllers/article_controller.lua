local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to
--
local sign_in_required = require "middlewares.sign_in_required"
local create_article = require "controllers.article_ctrl.create_article"
local rate_article = require "controllers.article_ctrl.rate_article"
local create_comment = require "controllers.article_ctrl.create_comment"
local advocate_comment = require "controllers.article_ctrl.advocate_comment"
local report_abuse = require "controllers.article_ctrl.report_abuse"
local get_article = require "controllers.article_ctrl.get_article"
local get_articles = require "controllers.article_ctrl.get_articles"

local function article_controller(app)
    local sign_in_filter = sign_in_required {
        redirect = false
    }

    app:match("/api/articles", respond_to({
        before = sign_in_filter,
        POST = json_params(create_article)
    }))
    app:get("/api/articles", get_articles)
    app:get("/api/articles/:article_id", get_article)
    app:match("/api/ratings", respond_to({
        before = sign_in_filter,
        POST = json_params(rate_article)
    }))
    app:match("/api/articles/:article_id/comments", respond_to({
        before = sign_in_filter,
        POST = json_params(create_comment)
    }))
    app:match("/api/comments/:comment_id/advocators", respond_to({
        before = sign_in_filter,
        PUT = json_params(advocate_comment)
    }))
    app:match("/api/abuse-reports", respond_to({
        before = sign_in_filter,
        POST = json_params(report_abuse)
    }))
end

return article_controller
