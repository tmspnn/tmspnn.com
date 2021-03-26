local User = require "models/user"
local Event = require "models/Event"

local function me_data(app)
    local ctx = app.ctx
    local uid = ctx.uid

    if not uid then
        return {redirect_to = "/sign-in?from=" .. ctx.escape("/me")}
    end

    local current_user = User:find_by_id(uid)

    local following_ids = User:get_following_ids(uid)
    local follower_ids = User:get_follower_ids(uid)

    local followings = {}

    if #following_ids > 0 then
        followings = User:find(
        [[ id, profile, nickname from "user" where id in ? ]],
        following_ids)
    end

    local followers = {}

    if #follower_ids > 0 then
        followers = User:find(
        [[ id, profile, nickname from "user" where id in ? ]],
        follower_ids)
    end

    local events = Event:find(
    [[ * from "event" where created_by = ? order by id desc limit ? ]],
    uid, 20)

    local policy, signature = User:generate_oss_upload_token(uid)

    return {
        page_name = "me",
        page_title = "拾刻阅读 | 个人主页",
        user = current_user,
        followings = followings,
        followers = followers,
        events = events,
        oss_policy = policy,
        oss_signature = signature
    }
end

return me_data
