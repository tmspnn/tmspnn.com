local User = require "models/user"

local function followings_data(app)
    local ctx = app.ctx
    local uid = ctx.uid

    if not uid then
        return {redirect_to = "/sign-in?from=" .. ctx.escape("/me")}
    end

    local current_user = User:find_by_id(uid)

    local following_ids = User:get_following_ids(uid)

    local followings = {}

    if #following_ids > 0 then
        followings = User:find(
                         "id, profile, nickname from \"user\" where id in ?",
                         following_ids)
    end

    return {
        page_name = "followings",
        page_title = "拾刻阅读 | 关注",
        user = current_user,
        followings = followings
    }
end

return followings_data
