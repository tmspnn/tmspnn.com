-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local db = require "lapis.db"

-- Local modules
local model = require "models/model"
local redis_client = require "models/redis_client"

local user = model:new("user")

local token_ttl = 60 * 60 * 24 * 14 -- two weeks

function user:get_id_by_token(user_token)
    local client = redis_client:new()
    local uid = client:run("get", string.format("user_token(%s):uid", user_token))
    return tonumber(uid)
end

function user:get_recommended()
    return self:find("* from \"user\" order by id desc limit 5")
end

function user:set_token(token, uid)
	local client = redis_client:new()
    client:run("setex", string.format("user_token(%s):uid", token), token_ttl, uid)
end

return user
