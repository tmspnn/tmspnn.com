-- Nginx interface provided by OpenResty
local ngx = require "ngx"

-- Implementation
local redis_client = {}

-- As a base class, __index points to self
redis_client.__index = redis_client

function redis_client:new(conf)
    local resty_redis = require "resty.redis"

    -- configuration
    if not conf then conf = {} end
    local timeout = conf.timeout or 1000
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

    if not res then
        self:on_error(command, err)
        return nil
    end

    self:post_run(command, ...)

    if res == ngx.null then return nil end

    return res
end

function redis_client:connect()
    local res, err = self.redis:connect(self.host, self.port)

    if not res then error(err) end

    self.connected = true
end

function redis_client:on_error(command, err)
    if command == "read_reply" and err == "timeout" then return end

    self:release()
    error(err)
end

function redis_client:post_run(command, ...)
    local params = {...}

    if command == "init_pipeline" then
        self.piping = true
    elseif command == "commit_pipeline" or command == "cancel_pipeline" then
        self.piping = false
    elseif command == "multi" then
        self.transactioning = true
    elseif command == "exec" or command == "discard" then
        self.transactioning = false
    elseif command == "subscribe" then
        local channels_count = #self.subscribed_channels
        for i = 1, #params do
            channels_count = channels_count + 1
            self.subscribed_channels[channels_count] = params[i]
        end
    elseif command == "unsubscribe" then
        for i = 1, #params do
            table.remove(self.subscribed_channels, params[i])
        end
    elseif command == "psubscribe" then
        local patterns_count = #self.subscribed_patterns
        for i = 1, #params do
            patterns_count = patterns_count + 1
            self.subscribed_patterns[patterns_count] = params[i]
        end
    elseif command == "punsubscribe" then
        for i = 1, #params do
            table.remove(self.subscribed_patterns, params[i])
        end
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

    local res, err

    if #self.subscribed_channels > 0 or #self.subscribed_patterns > 0 then
        res, err = self.redis:close()
    else
        res, err = self.redis:set_keepalive(10000, 100)
    end

    if not res then error(err) end

    self.connected = false
end

return redis_client
