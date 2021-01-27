-- @External
local validation = require "resty.validation"

-- @Local
local User = require "models/user"
local errors = require "models/error_messages"

local function update_user(app)
    local ctx = app.ctx
    local params = app.params
    local uid = tonumber(params.user_id)

    if uid ~= ctx.uid then
        return {status = 403, json = {err = errors["forbidden"]}}
    end

    local bg_image = ctx.trim(params.bg_image)
    local profile = ctx.trim(params.profile)
    local nickname = ctx.trim(params.nickname)
    local desc = ctx.trim(params.desc)
    local district = ctx.trim(params.district)

    User:update({
        bg_image = bg_image,
        profile = profile,
        nickname = nickname,
        desc = desc,
        district = district
    }, "id = ?", uid)

    app:write({status = 204})
end

return update_user
