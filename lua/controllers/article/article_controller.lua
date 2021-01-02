-- External modules
local lapis_application = require "lapis.application"
local json_params = lapis_application.json_params

-- Local modules
local util = require "util"
local controller = require "controllers/controller"
local rate_article = require "controllers/article/rate_article"
local comment_article = require "controllers/article/comment_article"

-- Initialization
local article_ctrl = controller:new()

util.push_back(article_ctrl.routes, {
    method = "post",
    path = "/api/ratings",
    handler = json_params(rate_article)
}, {
    method = "post",
    path = "/api/comments",
    handler = json_params(comment_article)
})

return article_ctrl
