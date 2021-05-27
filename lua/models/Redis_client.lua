-- Nginx interface provided by OpenResty
local ngx = require "ngx"

-- Implementation
local Redis_client = {}

-- As a base class, __index points to self
Redis_client.__index = Redis_client

function Redis_client:new(conf)
    local resty_redis = require "resty.redis"
    local redis = resty_redis:new()
    redis:set_timeout(1000) -- one second

    if not conf then
        conf = {}
    end

    local client = {
        host = conf.host or "127.0.0.1",
        port = conf.port or 6379,
        redis = redis,
        connected = false,
        piping = false,
        transactioning = false,
        subscribed_channels = {},
        subscribed_patterns = {}
    }

    return setmetatable(client, self)
end

function Redis_client:run(command, ...)
    if not self.connected then
        self:connect()
    end

    local res, err = self.redis[command](self.redis, unpack({...}))

    if not res then
        self:release()
        error(err)
    end

    self:post_run(command, unpack({...}))

    if res == ngx.null then
        return nil
    end

    return res
end

function Redis_client:connect()
    local res, err = self.redis:connect(self.host, self.port)

    if not res then
        error(err)
    end

    self.connected = true
end

function Redis_client:post_run(command, ...)
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

    if self.piping or self.transactioning or #self.subscribed_channels > 0 or #self.subscribed_patterns > 0 then
        return
    end

    self:release()
end

function Redis_client:release()
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

    if not res then
        error(err)
    end

    self.connected = false
end

return Redis_client
