-- Local modules
local User = require "models/User"

local function auth(app)
    local user_token = app.cookies.user_token

    if user_token then
        app.ctx.uid = User:get_id_by_token(user_token)
    end
end

return auth
