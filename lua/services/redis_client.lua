-- External modules
local ngx = require "ngx"

-- Local modules
local push = require "util.push"
local remove = require "util.remove"

-- Implementation
local redis_client = {}

-- As a base class, __index points to self
redis_client.__index = redis_client

-- @param {string} conf.host
-- @param {int} conf.timeout
-- @param {int} conf.port
function redis_client:new(conf)
    local resty_redis = require "resty.redis"

    if not conf then conf = {} end
    local timeout = conf.timeout or 10000 -- 10 seconds
    local host = conf.host or "127.0.0.1"
    local port = conf.port or 6379

    local redis = resty_redis:new()
    redis:set_timeout(timeout)

    local client = {
        host = host,
        port = port,
        redis = redis,
        connected = false,
        piping = false,
        transactioning = false,
        subscribed_channels = {},
        subscribed_patterns = {}
    }

    return setmetatable(client, self)
end

function redis_client:run(command, ...)
    if not self.connected then self:connect() end

    local res, err = self.redis[command](self.redis, ...)

    if not res then return self:on_error(command, err) end

    self:post_run(command, ...)

    if res == ngx.null then return nil end

    return res
end

function redis_client:connect()
    assert(self.redis:connect(self.host, self.port))
    self.connected = true
end

function redis_client:on_error(command, err)
    -- In case of temporarily idle channels
    if command == "read_reply" and err == "timeout" then return end

    self:release()
    error(err)
end

function redis_client:post_run(command, ...)
    if command == "init_pipeline" then
        self.piping = true
    elseif command == "commit_pipeline" or command == "cancel_pipeline" then
        self.piping = false
    elseif command == "multi" then
        self.transactioning = true
    elseif command == "exec" or command == "discard" then
        self.transactioning = false
    elseif command == "subscribe" then
        push(self.subscribed_channels, ...)
    elseif command == "unsubscribe" then
        remove(self.subscribed_channels, ...)
    elseif command == "psubscribe" then
        remove(self.subscribed_patterns, ...)
    elseif command == "punsubscribe" then
        push(self.subscribed_patterns, ...)
    end

    if self.piping or self.transactioning or #self.subscribed_channels > 0 or
        #self.subscribed_patterns > 0 then return end

    self:release()
end

function redis_client:release()
    if self.piping then
        self.redis:cancel_pipeline()
        self.piping = false
    end

    if self.transactioning then
        self.redis:discard()
        self.transactioning = false
    end

    if #self.subscribed_channels > 0 or #self.subscribed_patterns > 0 then
        assert(self.redis:close())
    else
        assert(self.redis:set_keepalive(10000, 100))
    end

    self.connected = false
end

return redis_client
