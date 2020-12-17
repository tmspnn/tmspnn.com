-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty

-- Local modules
local util = require "util"
local redis_client = {}

-- As a base class, __index points to self
redis_client.__index = redis_client

function redis_client:new()
    local redis = require "resty.redis"
    local red = redis:new()
    red:set_timeouts(1000, 1000, 1000) -- one second

    local client = {
        _redis = red,
        connected = false,
        piping = false,
        transactioning = false
    }

    return setmetatable(client, self)
end

function redis_client:run(command, ...)
    local red = self._redis
    local ok, err

    if not self.connected then
        self:connect()
    end

    local args = {...}

    ok, err = red[command](red, unpack(args))

    if not ok then
        self:release()
        error(err)
    end

    self:post_run(command)

    return ok
end

function redis_client:connect()
    local red = self._redis
    local ok, err = red:connect(ngx.var.redis_host, 6379)

    if not ok then
        error(err)
    end

    self.connected = true
end

function redis_client:post_run(command)
    if command == "init_pipeline" then
        self.piping = true
    end

    if command == "commit_pipeline" or command == "cancel_pipeline" then
        self.piping = false
    end

    if command == "multi" then
        self.transactioning = true
    end

    if command == "exec" or command == "discard" then
        self.transactioning = false
    end

    if self.piping or self.transactioning then
        return
    end

    self:release()
end

function redis_client:release()
    local red = self._redis

    if self.piping then
        red:cancel_pipeline()
    end

    if self.transactioning then
        red:discard()
    end

    -- ten seconds, pool size 100
    local ok, err = red:set_keepalive(10000, 100)

    util.assign(self, {
        connected = false,
        piping = false,
        transactioning = false
    })

    if not ok then
        error(err)
    end
end

return redis_client
