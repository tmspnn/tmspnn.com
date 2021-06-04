-- TODO: 整个 App 是 内容发布 + 评价机制 + 社交功能. 核心是内容的评价机制.
-- TODO: 文章评价 rating 影响用户声望 fame, 文章评分 rating 和文章权重 weight.
-- TODO: 用户声望代表用户的品质, 文章的 rating * weight = fame 代表文章的品质.
-- TODO: 对品质进行奖惩, 保证App的内省机制, 有益于产生更高品质的内容.
-- External modules
local date = require "date"
local lapis = require "lapis"

-- Local Modules
local auth = require "middlewares/auth"
local CORS = require "middlewares/CORS"
local context = require "middlewares/context"
local device = require "middlewares/device"
local exception = require "middlewares/exception"
local page_controller = require "controllers/page_controller"
local user_controller = require "controllers/user_controller"
local article_controller = require "controllers/article_controller"

-- Initialization
local app = lapis.Application()
app.handle_404 = exception.handle_404
app.handle_error = exception.handle_error

-- Templating
app:enable("etlua")
app.layout = require "views.layout"

-- Cookies
app.cookie_attributes = function(self)
    local expires = date():adddays(21):fmt("${http}")
    return "Expires=" .. expires .. "; Path=/; HttpOnly"
end

-- Middlewares
app:before_filter(CORS)
app:before_filter(context)
app:before_filter(device)
app:before_filter(auth)

-- Controllers
page_controller(app)
user_controller(app)
article_controller(app)

lapis.serve(app)
