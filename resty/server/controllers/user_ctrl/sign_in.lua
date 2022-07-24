local bcrypt = require "bcrypt"
--
local PG = require "services.PG"
local redis_client = require "services.redis_client"
local generate_user_token = require "util.generate_user_token"
local is_mobile = require "util.is_mobile"
local trim = require "util.trim"
local fmt = string.format

local TOKEN_TTL = 60 * 60 * 24 * 14 -- two weeks

local function remove_token(token)
    local client = redis_client:new()
    client:run("del", fmt("user_token(%s):uid", token))
end

local function set_token(token, uid)
    local client = redis_client:new()
    client:run("setex", fmt("user_token(%s):uid", token), TOKEN_TTL, uid)
end

local function sign_in(app)
    local mobile = trim(app.params.mobile)
    local password = trim(app.params.password)

    assert(is_mobile(mobile), "mobile.invalid")
    assert(#password >= 6, "password.invalid")

    local user_in_db = assert(PG.query([[
        select id, mobile, password from "user" where mobile = ?
    ]], mobile)[1], "mobile.not.registered")

    assert(bcrypt.verify(password, user_in_db.password), "password.not.match")

    if app.cookies.user_token then
        remove_token(app.cookies.user_token)
    end

    local user_token = generate_user_token(user_in_db.id)
    set_token(user_token, user_in_db.id)
    app.cookies.user_token = user_token

    return {
        json = {
            uid = user_in_db.id
        }
    }
end

return sign_in
