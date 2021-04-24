-- External modules
local lapis = require "lapis"

-- Local Modules
local auth = require "middlewares/auth"
local CORS = require "middlewares/CORS"
local context = require "middlewares/context"
local device = require "middlewares/device"
local exception = require "middlewares/exception"
local page_controller = require "controllers/page_controller"
-- local user_controller = require "controllers/user/user_controller"
-- local article_controller = require "controllers/article/article_controller"
-- local search_controller = require "controllers/search/search_controller"

-- Initialization
local app = lapis.Application()
app.handle_404 = exception.handle_404
app.handle_error = exception.handle_error

-- Templating
app:enable("etlua")
app.layout = require "views.layout"

-- Middlewares
app:before_filter(CORS)
app:before_filter(context)
app:before_filter(device)
app:before_filter(auth)

-- Controllers
page_controller(app)
-- user_controller:register(app)
-- article_controller:register(app)
-- search_controller:register(app)

lapis.serve(app)
