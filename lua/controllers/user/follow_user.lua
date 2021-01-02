local User = require "models/user"

local function follow_user(app)
    local following_id = app.params.user_id
    local follower_id = app.ctx.uid

    User:add_follower(following_id, follower_id)
    User:add_following(follower_id, following_id)

    app:write({
        status = 204
    })
end

return follow_user
