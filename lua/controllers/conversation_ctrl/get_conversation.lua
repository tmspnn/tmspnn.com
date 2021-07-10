local PG = require "services.PG"

local function get_conv(conv_id)
    return PG.query([[
        select
            id,
            created_by,
            members,
            title,
            muted_by,
            obj->'latest_message' as latest_message,
            obj->'meta_members' as meta_members,
            updated_at
        from "conversation"
        where id = ?
    ]], conv_id)[1]
end

local function get_conversation(app)
    local conv = assert(get_conv(tonumber(app.params.conversation_id)),
                        "conversation.not.exists")
    return {json = conv}
end

return get_conversation
