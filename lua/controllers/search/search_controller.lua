-- Local modules
local util = require "util"
local controller = require "controllers/controller"
local search_keyword = require "controllers/search/search_keyword"

--
local search_ctrl = controller:new()

util.push_back(search_ctrl.routes,
               {method = "get", path = "/api/search", handler = search_keyword})

return search_ctrl
