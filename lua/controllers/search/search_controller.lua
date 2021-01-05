-- External modules
local lapis_application = require "lapis.application"
local json_params = lapis_application.json_params

-- Local modules
local util = require "util"
local controller = require "controllers/controller"
local search_keyword = require "search_keyword"

-- Initialization
local search_ctrl = controller:new()

util.push_back(search_ctrl.routes, {
    method = "get",
    path = "/api/search",
    handler = search_keyword
})

return search_ctrl
