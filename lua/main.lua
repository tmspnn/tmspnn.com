-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local lapis = require "lapis"

-- Local modules
local auth = require "/middlewares/auth"
local cors = require "middlewares/cors"
local context = require "middlewares/context"
local device = require "middlewares/device"
local exception = require "middlewares/exception"
local page_controller = require "controllers/page_controller"
-- local user_controller = require "controllers/user_controller"
-- local article_controller = require "controllers/article_controller"

-- Initialization
local app = lapis.Application()
app.handle_404 = exception.handle_404
app.handle_error = exception.handle_error

-- Templating
app:enable("etlua")
app.layout = require "views.layout"

-- Middlewares
app:before_filter(cors.add_headers_if_necessary)
app:before_filter(context.init)
app:before_filter(device.detect)
app:before_filter(auth.get_uid)

-- Controllers
page_controller:register(app)
-- user_controller.register(app)
-- article_controller.register(app)

lapis.serve(app)
