-- External modules
local cjson = require "cjson"
local db = require "lapis.db"

-- Local modules
local PG = require "services.PG"
local fmt = string.format

local function get_comment(comment_id)
    return PG.query([[
        select id, article_id from "comment" where id = ?
    ]], comment_id)[1]
end

local function has_advocated(uid, article_id, comment_id)
    return PG.query([[
        select id
        from "interaction"
        where
            created_by = ? and
            refer_to = ? and
            "type" = 1 and
            obj @> '{"comment_id": ?}'
    ]], uid, article_id, comment_id)[1]
end

local function advocate(uid, article_id, comment_id)
    local obj = fmt("'%s'::jsonb", cjson.encode({comment_id = comment_id}))

    return PG.query([[
        begin;

        insert into "interaction"
            ("type", created_by, refer_to, obj)
        values
            (1, ?, ?, ?);

        update "comment"
        set advocators_count = advocators_count + 1
        where id = ?;

        commit;
    ]], uid, article_id, db.raw(obj), comment_id)
end

local function undo_advocation(uid, article_id, comment_id)
    return PG.query([[
        begin;

        delete from "interaction"
        where
            created_by = ? and
            refer_to = ? and
            "type" = 1 and
            obj @> '{"comment_id": ?}';

        update "comment"
        set advocators_count = advocators_count - 1
        where id = ?;

        commit;
    ]], uid, article_id, comment_id, comment_id)
end

local function advocate_comment(app)
    local ctx = app.ctx
    local comment_id = assert(tonumber(app.params.comment_id),
                              "comment.not.exist")
    local comment = assert(get_comment(comment_id), "comment.not.exist")
    local article_id = comment.article_id
    local advocated = has_advocated(ctx.uid, article_id, comment_id)

    if advocated then
        undo_advocation(ctx.uid, article_id, comment_id)
    else
        advocate(ctx.uid, article_id, comment_id)
    end

    return {json = {advocated = not advocated}}
end

return advocate_comment
