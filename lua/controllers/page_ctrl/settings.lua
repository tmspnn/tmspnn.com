local PG = require "services.PG"
local get_oss_token = require "util.get_oss_token"
local oss_path_to_url = require "util.oss_path_to_url"
local tags = require "util.tags"

local function get_user(uid)
    return PG.query([[
        select
            id,
            mobile,
            password,
            nickname,
            profile,
            gender,
            state,
            description,
            location,
            fame,
            email,
            identity_no,
            obj->'bg_image' as bg_image
        from "user"
        where id = ?
    ]], uid)[1]
end

local function settings(app)
    local ctx = app.ctx

    local user = get_user(ctx.uid)

    if not user then error("user.not.exists", 0) end

    user.bg_image = oss_path_to_url(user.bg_image)
    user.profile = oss_path_to_url(user.profile)

    local policy, signature = get_oss_token(ctx.uid)

    ctx.data = {
        uid = ctx.uid,
        user = user,
        oss_policy = policy,
        oss_signature = signature
    }
    ctx.page_title = user.nickname
    ctx.tags_in_head = {tags:css("settings")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("settings")}

    return {render = "pages.settings"}
end

return settings
