-- External modules
local bcrypt = require "bcrypt"

local cjson = require "cjson"
local db = require "lapis.db"

local uuid = require "resty.jit-uuid"
uuid.seed()

-- Local modules
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

    if not is_mobile(mobile) then error("mobile.invalid", 0) end

    if #vcode ~= 4 or tonumber(vcode) == nil then error("vcode.invalid", 0) end

    if #password < 6 then error("password.invalid", 0) end

    local duplicated = PG.query([[
        select id from "user" where mobile = ?
    ]], mobile)[1]

    if duplicated then error("mobile.already.exists", 0) end

    local existed_vcode = get_vcode(mobile)

    if not existed_vcode or vcode ~= existed_vcode then
        error("vcode.not.match", 0)
    end

    local uid = uuid()
    local digested_password = bcrypt.digest(password, LOG_ROUNDS)
    local json = cjson.encode({uuid = uid})

    local user = PG.create("user", {
        password = digested_password,
        nickname = uid,
        mobile = mobile,
        email = uid .. ":email",
        identity_no = uid .. ":identity_no",
        obj = db.raw(fmt("'%s'::jsonb", json))
    })[1]

    if app.cookies.user_token then remove_token(app.cookies.user_token) end

    local user_token = generate_user_token(user.id)
    set_token(user_token, user.id)
    app.cookies.user_token = user_token

    remove_vcode(mobile)

    return {status = 204}
end

return sign_up
