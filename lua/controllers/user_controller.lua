-- External modules
local bcrypt = require "bcrypt"
local db = require "lapis.db"
local json_params = require("lapis.application").json_params
local respond_to = require("lapis.application").respond_to
local uuid = require "resty.jit-uuid"

uuid.seed()

-- Local modules
local User = require "models/User"
local is_mobile = require "util/is_mobile"

-- Constants and alias
local log_rounds = 9
local fmt = string.format

local function sign_in_required(app)
    if not app.ctx.uid then error("not.authorized", 0) end
end

local function sign_in(app)
    local mobile = app.params.mobile
    local password = app.params.password

    if not string.match(mobile, "1[34578]%d%d%d%d%d%d%d%d%d") then
        error("mobile.invalid", 0)
    end

    if #password < 6 then error("password.invalid", 0) end

    local user_in_db = User:query([[
        select id, mobile, password from "user" where mobile = ?
    ]], mobile)[1]

    if not user_in_db then error("mobile.not.registered", 0) end

    if not bcrypt.verify(password, user_in_db.password) then
        error("password.not.match", 0)
    end

    if app.cookies.user_token then User:remove_token(app.cookies.user_token) end

    local user_token = User:generate_user_token(user_in_db.id)
    User:set_token(user_token, user_in_db.id)
    app.cookies.user_token = user_token

    return {status = 204}
end

local function sign_up(app)
    local ctx = app.ctx
    ctx.trim_all(app.params)

    local mobile = app.params.mobile
    local vcode = app.params.vcode
    local password = app.params.password

    if not is_mobile(mobile) then error("mobile.invalid", 0) end

    if #vcode ~= 4 or tonumber(vcode) == nil then error("vcode.invalid", 0) end

    if #password < 6 then error("password.invalid", 0) end

    local duplicated = User:query([[
        select id from "user" where mobile = ?
    ]], mobile)

    if #duplicated > 0 then error("mobile.already.exists", 0) end

    local existed_vcode = User:get_vcode(mobile)

    if not existed_vcode or vcode ~= existed_vcode then
        error("vcode.not.match", 0)
    end

    local uid = uuid()
    local digested_password = bcrypt.digest(password, log_rounds)
    local json = ctx.to_json({uuid = uid, ratings_count = 0})

    local user = User:create({
        password = digested_password,
        nickname = uid,
        mobile = mobile,
        email = uid .. ":email",
        identity_no = uid .. ":identity_no",
        obj = db.raw(fmt("'%s'::jsonb", json))
    })

    if app.cookies.user_token then User:remove_token(app.cookies.user_token) end

    local user_token = User:generate_user_token(user.id)
    User:set_token(user_token, user.id)
    app.cookies.user_token = user_token

    User:remove_vcode(mobile)

    return {json = user}
end

local function send_vcode(app)
    local ctx = app.ctx
    ctx.trim_all(app.params)

    local mobile = app.params.mobile

    if not is_mobile(mobile) then error("mobile.invalid", 0) end

    local existed_vcode = User:get_vcode(mobile)

    if existed_vcode then error("vcode.not.available", 0) end

    local vcode = string.sub(math.random(), -4)

    User:set_vcode(vcode, mobile)

    return {json = {mobile = mobile, vcode = vcode}}
end

local function toggle_followship(app)
    local author_id = tonumber(app.params.user_id)
    if not author_id then error("user.not.exists", 0) end
    local uid = app.ctx.uid
    local has_followed = User:has_followed(uid, author_id)
    if has_followed then
        User:unfollow(uid, author_id)
    else
        User:follow(uid, author_id)
    end
    return {json = {followed = not has_followed}}
end

local function user_controller(app)
    app:post("/api/sign-in", json_params(sign_in))
    app:post("/api/sign-up", json_params(sign_up))
    app:post("/api/vcodes", json_params(send_vcode))
    app:match("/api/users/:user_id/followers",
              respond_to({before = sign_in_required, PUT = toggle_followship}))
end

return user_controller
