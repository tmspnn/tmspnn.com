-- @External
local db = require "lapis.db"

-- @Local
local model = require "models/model"
local redis_client = require "models/redis_client"

local event = model:new("event")

return event
