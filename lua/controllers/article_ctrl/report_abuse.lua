local cjson = require "cjson"
local db = require "lapis.db"
--
local PG = require "services.PG"
local fmt = string.format

local function get_comment(comment_id)
    return PG.query([[
        select id, created_by from "comment" where id = ?;
    ]], comment_id)[1]
end

local function create_abuse_report(uid, comment, reason)
    local obj = fmt("'%s'::jsonb", cjson.encode {
        reason = reason
    })

    local reported = PG.query([[
        select id from "interaction"
        where created_by = ? and refer_to = ? and "type" = 3;
    ]], uid, comment.id)[1]

    if reported then
        return
    end

    return PG.query([[
        begin;

        insert into "interaction"
            ("type", created_by, refer_to, obj)
        values
            (3, ?, ?, ?);

        update "comment" set state = 1 where id = ?;

        update "user" set fame = fame - 1 where id = ?;

        commit;
    ]], uid, comment.id, db.raw(obj), comment.id, comment.created_by)
end

local function report_abuse(app)
    local comment_id = assert(tonumber(app.params.commentId), "comment.not.exists")
    local comment = assert(get_comment(comment_id), "comment.not.exists")
    local reason = app.params.reason

    create_abuse_report(app.ctx.uid, comment, reason)

    return {
        status = 204
    }
end

return report_abuse
