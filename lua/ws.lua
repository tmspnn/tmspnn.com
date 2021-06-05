-- TODO: 不在线时存收件箱, 更新收件箱信息数
-- External modules
local cjson = require "cjson"
local ck = require "resty.cookie"
local ngx = require "ngx"
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
                        -- TODO: if not success, add to offline messages(write into db.user.obj)
                    end
                end
            end

            ngx.sleep(1)
        end
    end

    send()
end

xpcall(main, handle_exception)
