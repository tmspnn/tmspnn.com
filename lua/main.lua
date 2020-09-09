-- The Nginx interface provided by OpenResty
local ngx = require("ngx")

-- Middlewares
local CORS = require("./middlewares/CORS")
local device = require("./middlewares/device")
local exception = require("./middlewares/exception")

-- Controllers
local page_controller = require("./controllers/page_controller")

-- Initialization
local lapis = require("lapis")
local app = lapis.Application()

app.handle_404 = exception.handle_404
app.handle_error = exception.handle_error

-- Templating
app:enable("etlua")
app.layout = require("views.layout")

-- Register middlewares
app:before_filter(CORS.add_headers_if_necessary)
app:before_filter(device.detect)

-- Register controllers
page_controller.bind(app)

lapis.serve(app)
