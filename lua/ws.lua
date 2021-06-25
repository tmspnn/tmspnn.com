-- External modules
local cjson = require "cjson"
local ck = require "resty.cookie"
local ngx = require "ngx"
local PG = require "services.PG"
local server = require "resty.websocket.server"

-- Local modules
local each = require "util.each"
local redis_client = require "services.redis_client"
local unescape = require "util.unescape"

-- Aliases
local fmt = string.format

-- @param {string} err
-- @returns {nil}
local function handle_exception(err)
    ngx.log(ngx.ERR, "WebSocket: ", err)
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

    -- One miniute, the same as nginx's default send_timeout
    local wb = assert(server:new{timeout = 60000})

    -- Respond to ping
    ngx.thread.spawn(function()
        while true do
            local data, typ, err = wb:recv_frame()

            if not data then error(err) end

            if typ == "close" then
                assert(wb:send_close())
                ngx.exit(499)
            elseif typ == "ping" then
                assert(wb:send_pong())
            elseif typ == "text" and data == "ping" then
                assert(wb:send_text("pong"))
            end
        end
    end)

    local function listen()
        -- Send offline messages
        local i = 0
        local messages_page

        repeat
            messages_page = get_offline_messages(uid, 100 * i)
            assert(wb:send_text(cjson.encode(messages_page)))
            i = i + 1
        until #messages_page < 100

        remove_offline_messages(uid)

        local client = redis_client:new({timeout = 60000}) -- 60 seconds
        client:run("subscribe", fmt("uid(%s):inbox", uid))

        while true do
            local msg = client:run("read_reply")

            -- ["message","uid(4):inbox","{ JSON string of message }"]
            if msg then assert(wb:send_text(msg[3])) end
        end
    end

    listen()
end

xpcall(main, handle_exception)
