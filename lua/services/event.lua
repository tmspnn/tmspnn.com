-- @External
local db = require "lapis.db"

-- @Local
local Model = require "models/Model"
local redis_client = require "models/redis_client"

local event = Model:new("event")

return event
