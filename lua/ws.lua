-- External modules
local cjson = require "cjson"
local ck = require "resty.cookie"
local ngx = require "ngx"
local PG = require "services.PG"
local server = require "resty.websocket.server"

-- Local modules and aliases
local redis_client = require "services.redis_client"
local unescape = require "util.unescape"
local fmt = string.format

-- @param {string} err
-- @returns {nil}
local function handle_exception(err)
    ngx.log(ngx.ERR, "WebSocket Error -> ", err)
    ngx.exit(444)
end

local function get_offline_messages(uid, offset)
    return PG.query([[
        select inbox[?:?] as offline_messages from "user" where id = ?
    ]], offset + 1, offset + 100, uid)[1]
end

local function remove_offline_messages(uid)
    return PG.query([[
        update "user" set inbox = '{}' where id = ?
    ]], uid)
end

local function get_uid()
    local cookie = assert(ck:new())
    local user_token = assert(cookie:get("user_token"))
    local uid = nil

    if user_token then
        local client = redis_client:new()
        uid = client:run("get", fmt("user_token(%s):uid", unescape(user_token)))
    end

    return tonumber(uid)
end

local function main()
    local uid = assert(get_uid())

    -- Timeout is 60 seconds, the same as nginx's default send_timeout
    local wb = assert(server:new{timeout = 60000})
    local rds = redis_client:new({timeout = 60000})

    local function send_offline_messages()
        local i = 0
        local messages_page

        repeat
            messages_page = get_offline_messages(uid, 100 * i)
            assert(wb:send_text(cjson.encode(messages_page)))
            i = i + 1
        until #messages_page < 100

        remove_offline_messages(uid)
    end

    local function listen_ws()
        while true do
            local data, typ, err = wb:recv_frame()

            if not data then error(err) end

            if typ == "close" then
                assert(wb:send_close())
                ngx.exit(499)
            elseif typ == "ping" then
                assert(wb:send_pong())
            elseif typ == "text" and data == "ping" then
                local rds = redis_client:new()
                rds:run("publish", fmt("uid(%s):inbox", uid), "pong")
            end
        end
    end

    send_offline_messages()

    ngx.thread.spawn(listen_ws)

    rds:run("subscribe", fmt("uid(%s):inbox", uid))

    while true do
        local msg = rds:run("read_reply")

        if not msg then
            rds:release()
            break
        end

        -- ["message","uid(4):inbox","{ JSON string of message }"]
        assert(wb:send_text(msg[3]))
    end
end

xpcall(main, handle_exception)
