local User = require "models/user"

local function followers_data(app)
    local ctx = app.ctx
    local uid = ctx.uid

    if not uid then
        return {redirect_to = "/sign-in?from=" .. ctx.escape("/followers")}
    end

    local current_user = User:find_by_id(uid)

    local follower_ids = User:get_follower_ids(uid)

    local followers = {}

    if #follower_ids > 0 then
        followers = User:find(
                        "id, profile, nickname from \"user\" where id in ?",
                        follower_ids)
    end

    return {
        page_name = "followings",
        page_title = "拾刻阅读 | 关注",
        user = current_user,
        followers = followers
    }
end

return followers_data
