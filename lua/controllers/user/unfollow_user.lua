local User = require "models/user"

local function unfollow_user(app)
    local following_id = app.params.user_id
    local follower_id = app.ctx.uid

    User:remove_follower(following_id, follower_id)
    User:remove_following(follower_id, following_id)

    app:write({
        status = 204
    })
end

return unfollow_user
