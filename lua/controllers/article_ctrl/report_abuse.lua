-- External modules
local cjson = require "cjson"
local db = require "lapis.db"

-- Local modules
local PG = require "services.PG"
local fmt = string.format

local function create_abuse_report(uid, comment_id, reason)
    local obj = fmt("'%s'::jsonb", cjson.encode({reason = reason}))
    return PG.query([[
        insert into "interaction"
            ("type", created_by, refer_to, obj)
        values
            (3, ?, ?, ?)
    ]], uid, comment_id, db.raw(obj))
end

local function report_abuse(app)
    local comment_id = tonumber(app.params.commentId)

    if not comment_id then error("comment.not.exists", 0) end

    local reason = app.params.reason

    create_abuse_report(app.ctx.uid, comment_id, reason)

    return {status = 204}
end

return report_abuse
