-- External modules
local lapis_application = require "lapis.application"
local json_params = lapis_application.json_params

-- Local modules
local util = require "util"
local controller = require "controllers/controller"
local rate_article = require "controllers/article/rate_article"
local comment_article = require "controllers/article/comment_article"
local like_comment = require "controllers/article/like_comment"

-- Initialization
local article_ctrl = controller:new()

util.push_back(article_ctrl.routes, {
    method = "post",
    path = "/api/ratings",
    handler = json_params(rate_article)
}, {
    method = "post",
    path = "/api/articles/:article_id/comments",
    handler = json_params(comment_article)
}, {
    method = "put",
    path = "/api/articles/:article_id/comments/:comment_id/attitudes",
    handler = json_params(like_comment)
})

return article_ctrl
