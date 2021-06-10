-- External modules
local date = require "date"
local lapis = require "lapis"

-- Local Modules
local context = require "middlewares.context"
local CORS = require "middlewares.CORS"
local exception = require "middlewares.exception"
local page_controller = require "controllers.page_controller"
local user_controller = require "controllers.user_controller"
local article_controller = require "controllers.article_controller"

-- Initialization
local app = lapis.Application()
app.handle_404 = exception.handle_404
app.handle_error = exception.handle_error

-- Templating
app:enable("etlua")
app.layout = require "views.layout"

-- TTL of Cookies
app.cookie_attributes = function()
    local expires = date():adddays(21):fmt("${http}")
    return "Expires=" .. expires .. "; Path=/; HttpOnly"
end

-- Middlewares
app:before_filter(CORS)
app:before_filter(context)

-- Controllers
page_controller(app)
user_controller(app)
article_controller(app)

lapis.serve(app)
