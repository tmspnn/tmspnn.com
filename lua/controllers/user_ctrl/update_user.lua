local PG = require "services.PG"
local fmt = string.format

local function update_user(app)
    local ctx = app.ctx
    local uid = tonumber(app.params.user_id)

    if (uid ~= ctx.uid) then error("forbidden", 0) end

    local bg_image = app.params.bgImage or ""
    local profile = app.params.profile or ""
    local nickname = app.params.nickname or ""
    local description = app.params.description or ""
    local location = app.params.location or ""

    local res = PG.query([[
        update "user"
        set
            obj = jsonb_set(obj, '{bg_image}', ?),
            profile = ?,
            nickname = ?,
            description = ?,
            location = ?,
            ts_vector = to_tsvector(? || ?)
        where id = ?
    ]], fmt("\"%s\"", bg_image), profile, nickname, description, location,
                         nickname, description, uid)

    return {json = res}
end

return update_user
