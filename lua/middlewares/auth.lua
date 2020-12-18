-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty

-- Local modules
local User = require "models/user"
local auth = {}

function auth.get_uid(app)
    local user_token = app.cookies.user_token

    if user_token then
        app.ctx.uid = User:get_id_by_token(user_token)
    end
end

return auth
