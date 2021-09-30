local bcrypt = require "bcrypt"
local cjson = require "cjson"
local db = require "lapis.db"
local uuid = require "resty.jit-uuid"
uuid.seed()
--
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local generate_user_token = require "util.generate_user_token"
local is_mobile = require "util.is_mobile"
local trim = require "util.trim"
local fmt = string.format

local LOG_ROUNDS = 9
local TOKEN_TTL = 60 * 60 * 24 * 14 -- two weeks

local function get_vcode(mobile)
    local client = redis_client:new()
    return client:run("get", fmt("mobile(%s):vcode", mobile))
end

local function remove_vcode(mobile)
    local client = redis_client:new()
    client:run("del", fmt("mobile(%s):vcode", mobile))
end

local function remove_token(token)
    local client = redis_client:new()
    client:run("del", fmt("user_token(%s):uid", token))
end

local function set_token(token, uid)
    local client = redis_client:new()
    client:run("setex", fmt("user_token(%s):uid", token), TOKEN_TTL, uid)
end

local function sign_up(app)
    local ctx = app.ctx
    local mobile = trim(app.params.mobile)
    local vcode = trim(app.params.vcode)
    local password = trim(app.params.password)

    assert(is_mobile(mobile), "mobile.invalid")
    assert(#vcode == 4 and tonumber(vcode) ~= nil, "vcode.invalid")
    assert(#password >= 6, "password.invalid")

    local user_in_db = PG.query([[
        select id from "user" where mobile = ?
    ]], mobile)[1]

    assert(user_in_db == nil, "mobile.already.exists")

    local existed_vcode = get_vcode(mobile)

    assert(vcode == existed_vcode, "vcode.not.match")

    local uid = uuid()
    local digested_password = bcrypt.digest(password, LOG_ROUNDS)
    local json = cjson.encode({
        uuid = uid
    })
    local user = PG.create("user", {
        password = digested_password,
        nickname = uid,
        mobile = mobile,
        email = uid .. ":email",
        identity_no = uid .. ":identity_no",
        obj = db.raw(fmt("'%s'::jsonb", json))
    })[1]

    if app.cookies.user_token then
        remove_token(app.cookies.user_token)
    end

    local user_token = generate_user_token(user.id)
    set_token(user_token, user.id)
    app.cookies.user_token = user_token
    remove_vcode(mobile)

    return {
        json = {
            uid = user.id
        }
    }
end

return sign_up
