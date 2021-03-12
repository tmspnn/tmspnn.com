-- External modules
local json_params = require("lapis.application").json_params

-- Local modules
local util = require("util")
local controller = require("controllers/controller")
local rate_article = require("controllers/article/rate_article")
local create_comment= require("controllers/article/create_comment")
local like_comment = require("controllers/article/like_comment")
local get_articles = require("controllers/article/get_articles")
local create_article = require("controllers/article/create_article")
local update_article = require("controllers/article/update_article")

-- Initialization
local article_ctrl = controller:new()

util.push_back(article_ctrl.routes, {
    method = "post",
    path = "/api/articles/:article_id/ratings",
    handler = json_params(rate_article)
}, {
    method = "post",
    path = "/api/articles/:article_id/comments",
    handler = json_params(create_comment)
}, {
    method = "put",
    path = "/api/comments/:comment_id/attitudes",
    handler = json_params(like_comment)
}, {
    method = "get",
    path = "/api/articles",
    handler = get_articles
}, {
    method = "post",
    path = "/api/articles",
    handler = json_params(create_article)
}, {
    method = "put",
    path = "/api/articles",
    handler = json_params(update_article)
})

return article_ctrl
