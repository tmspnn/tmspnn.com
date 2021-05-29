-- External modules
local bcrypt = require "bcrypt"
local db = require "lapis.db"
local json_params = require("lapis.application").json_params
local ngx = require "ngx"
local uuid = require "resty.jit-uuid"
local validation = require "resty.validation"

uuid.seed()

-- Local modules
local User = require "models/User"
local is_mobile = require "util/is_mobile"

-- Constants and alias
local log_rounds = 9
local fmt = string.format

local function sign_in(app)
    local ctx = app.ctx
    ctx.trim_all(app.params)

    local mobile = app.params.email
    local password = app.params.password

    if not string.match(mobile, "1[34578]%d%d%d%d%d%d%d%d%d") then
        error("mobile.invalid", 0)
    end

    if #password < 6 then
        error("password.invalid", 0)
    end

    local user_in_db = User:find([[
        id, email, password from "user" where mobile = ?
    ]], mobile)[1]

    if not user_in_db then
        error("mobile.not.registered", 0)
    end

    if not bcrypt.verify(password, user_in_db.password) then
        error("password.not.match", 0)
    end

    local user_token = User:generate_user_token(user_in_db.id)
    User:set_token(user_token, user_in_db.id)
    app.cookies.user_token = user_token

    return {
        status = 204
    }
end

local function sign_up(app)
    local ctx = app.ctx
    ctx.trim_all(app.params)

    local mobile = app.params.mobile
    local vcode = app.params.vcode
    local password = app.params.password

    if not is_mobile(mobile) then
        error("mobile.invalid", 0)
    end

    if #vcode ~= 4 or tonumber(vcode) == nil then
        error("vcode.invalid", 0)
    end

    if #password < 6 then
        error("password.invalid", 0)
    end

    local duplicated = User:find([[
        id from "user" where mobile = ?
    ]], mobile)

    if #duplicated > 0 then
        error("email.already.exists", 0)
    end

    local existed_vcode = User:get_vcode(mobile)

    if not existed_vcode or vcode ~= existed_vcode then
        error("vcode.not.match", 0)
    end

    local uid = uuid()
    local digested_password = bcrypt.digest(password, log_rounds)
    local json = ctx.to_json({
        uuid = uid
    })

    local user = User:create({
        password = digested_password,
        nickname = uid,
        mobile = mobile,
        email = uid .. ":mobile",
        identity_no = uid .. ":identity_no",
        obj = db.raw(fmt("'%s'::jsonb", json)),
        ts_vector = db.raw("to_tsvector('')")
    })

    local user_token = User:generate_user_token(user.id)
    User:set_token(user_token, user.id)
    app.cookies.user_token = user_token

    User:remove_vcode(mobile)

    return {
        json = user
    }
end

local function send_vcode(app)
    local ctx = app.ctx
    ctx.trim_all(app.params)

    local mobile = app.params.mobile

    if not is_mobile(mobile) then
        error("mobile.invalid", 0)
    end

    local existed_vcode = User:get_vcode(mobile)

    if existed_vcode then
        error("vcode.not.available", 0)
    end

    local vcode = string.sub(math.random(), -4)

    User:set_vcode(vcode, mobile)

    return {
        json = {
            mobile = mobile,
            vcode = vcode
        }
    }
end

local function user_controller(app)
    app:post("/api/sign-in", json_params(sign_in))
    app:post("/api/sign-up", json_params(sign_up))
    app:post("/api/vcodes", json_params(send_vcode))
end

return user_controller
