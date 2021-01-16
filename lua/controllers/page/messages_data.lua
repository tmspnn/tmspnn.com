local User = require "models/user"

local function messages_data(app)
    local ctx = app.ctx
    local uid = ctx.uid

    if not uid then
        return {redirect_to = "/sign-in?from=" .. ctx.escape("/messages")}
    end

    local current_user = User:find_by_id(uid)

    -- TODO: design data structure of messaging between users

    return {
        page_name = "followings",
        page_title = "拾刻阅读 | 消息",
        user = current_user
    }
end

return messages_data
