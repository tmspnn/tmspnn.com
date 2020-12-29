-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local lapis_util = require "lapis.util"
local to_json = lapis_util.to_json

-- Local modules
local controller = require "controllers/controller"

-- Initialization
local article_controller = controller:new()

return article_controller
