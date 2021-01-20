-- @External
local bcrypt = require "bcrypt"
local log_rounds = 9

local uuid = require "resty.jit-uuid"
uuid.seed()

local validation = require "resty.validation"

-- @Local
local User = require "models/user"
local errors = require "models/error_messages"

-- @Implementation
local function sign_up(app)
    local ctx = app.ctx

    local email = ctx.trim(app.params.email)
    local vcode = ctx.trim(app.params.vcode)
    local password = ctx.trim(app.params.password)

    local is_email, _ = validation.email(email)

    if not is_email then
        return {status = 400, json = {err = errors["email.invalid"]}}
    end

    if #vcode ~= 4 or tonumber(vcode) == nil then
        return {status = 400, json = {err = errors["vcode.invalid"]}}
    end

    if #password < 6 then
        return {status = 400, json = {err = errors["password.invalid"]}}
    end

    local duplicates = User:find("id from \"user\" where email = ?", email)

    if #duplicates > 0 then
        return {status = 400, json = {err = errors["email.already.exists"]}}
    end

    local existed_vcode = User:get_vcode(email)

    if not existed_vcode or vcode ~= existed_vcode then
        return {status = 400, json = {err = errors["vcode.not.match"]}}
    end

    local uniq_id = uuid()
    local digested_password = bcrypt.digest(password, log_rounds)

    -- {1 = user, affected_rows = 1}
    local db_res = User:create({
        email = email,
        mobile = uniq_id,
        password = digested_password,
        nickname = "匿名" .. uniq_id
    })
    local user = db_res[1]

    local user_token = User:generate_user_token(user.id)
    User:set_token(user_token, user.id)
    app.cookies.user_token = user_token

    User:remove_vcode(email)

    return {status = 204}
end

return sign_up
