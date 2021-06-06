-- External modules
local cjson = require "cjson"
local ck = require "resty.cookie"
local ngx = require "ngx"
local pgmoon = require "pgmoon"
local server = require "resty.websocket.server"

-- Local modules
local Redis_client = require "models/Redis_client"
local unescape = require "util/unescape"

-- Aliases
local fmt = string.format

-- @param {string} err
-- @returns {nil}
local function handle_exception(err)
    ngx.log(ngx.ERR, "WebSocket: ", err)
    ngx.exit(444)
end

local pg = pgmoon.new({
    host = ngx.var.pg_host or "127.0.0.1",
    port = ngx.var.pg_port or 5432,
    database = "tmspnn",
    user = "thomas"
})

-- @param {number} to
-- @param {string} data
local function send_to_inbox(to, data)
    assert(pg:connect(), "PG: Connection Failed!")
    assert(pg:query(fmt([[
        update "user"
        set inbox = array_append(inbox, '%s')
        where id = %s
    ]], pg:escape_literal(data), to), "PG: Insertion Failed"))
    pg:keepalive()
end

local function get_offline_messages(uid, page_no, page_size)
    local offset = page_size * (page_no - 1);
    return assert(pg:query(fmt([[
        select inbox[%s:%s] from "user" where id = %s
    ]], offset + 1, offset + page_size, uid))[1].inbox, "PG: Query Failed")
end

local function get_uid()
    local cookie, err = ck:new()

    if not cookie then
        error(err)
    end

    local uid = nil
    local user_token, _ = cookie:get("user_token")

    if type(user_token) == "string" and #user_token > 0 then
        local client = Redis_client:new()
        uid = client:run("get", fmt("user_token(%s):uid", unescape(user_token)))
    end

    return tonumber(uid)
end

local function main()
    local uid = get_uid()

    if not uid then
        error("401 - Sign in required.")
    end

    local wb, err = server:new{
        timeout = 60000,
        max_payload_len = 65535
    }

    if not wb then
        error(err)
    end

    local function receive()
        assert(pg:connect(), "PG: Connection Failed!")

        local page
        local page_no = 1
        local page_size = 2

        repeat
            page = get_offline_messages(uid, page_no, page_size)
            wb:send_text(cjson.encode(page))
            page_no = page_no + 1
        until #page < page_size

        pg:keepalive()

        local client = Redis_client:new()
        client:run("subscribe", fmt("uid(%s):inbox", uid))

        while true do
            local msg = client:run("read_reply")

            -- ["message","uid(4):inbox","{\"to\":4,\"text\":\"adsasdasdasd\"}"]
            if msg then
                local bytes, err = wb:send_text(cjson.encode(msg))
                if not bytes then
                    error(err)
                end
            end

            ngx.sleep(1)
        end
    end

    ngx.thread.spawn(receive)

    local function send()
        while true do
            local data, typ, _ = wb:recv_frame()

            if not data then
                ngx.exit(444)
            end

            if typ == "close" then
                local bytes, err = wb:send_close()
                if not bytes then
                    error(err)
                end
                ngx.exit(499)
            elseif typ == "ping" then
                local bytes, err = wb:send_pong()
                if not bytes then
                    error(err)
                end
            elseif typ == "text" then
                local json = cjson.decode(data)

                if json.type == "ping" then
                    local msg = {
                        type = "pong"
                    }
                    local bytes, err = wb:send_text(cjson.encode(msg))
                    if not bytes then
                        error(err)
                    end
                else
                    local to = json.to -- @property {number} json.to
                    
                    if type(to) == "number" and to > 0 then
                        local client = Redis_client:new()
                        local success = client:run("publish", fmt("uid(%s):inbox", to), data)
                        if success == 0 then
                            send_to_inbox(to, data)
                        end
                    end
                end
            end

            ngx.sleep(1)
        end
    end

    send()
end

xpcall(main, handle_exception)
