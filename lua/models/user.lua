-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local db = require "lapis.db"

-- Local modules
local model = require "models/model"
local redis_client = require "models/redis_client"
local user = {}

function user.get_id_by_token(user_token)
    local client = redis_client:new()
    local uid = client:run("get", string.format("user_token(%s):uid", user_token))
    return tonumber(uid)
end

return user
