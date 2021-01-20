-- @External
local bcrypt = require "bcrypt"
local validation = require "resty.validation"
local uuid = require "resty.jit-uuid"
uuid.seed()

-- @Local
local User = require "models/user"
local errors = require "models/error_messages"

-- @Implementation
local function sign_in(app)
    local ctx = app.ctx

    local email = ctx.trim(app.params.email)
    local password = ctx.trim(app.params.password)

    local is_email, _ = validation.email(email)

    if not is_email then
        return {status = 400, json = {err = errors["email.invalid"]}}
    end

    if #password < 6 then
        return {status = 400, json = {err = errors["password.invalid"]}}
    end

    local user_in_db = User:find(
                           "id, email, password from \"user\" where email = ?",
                           email)[1]

    if not user_in_db then
        return {status = 400, json = {err = errors["email.not.registered"]}}
    end

    if not bcrypt.verify(password, user_in_db.password) then
        return {status = 400, json = {err = errors["password.not.match"]}}
    end

    local user_token = User:generate_user_token(user_in_db.id)
    User:set_token(user_token, user_in_db.id)
    app.cookies.user_token = user_token

    return {status = 204}
end

return sign_in
