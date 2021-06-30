-- External modules
local ngx = require "ngx"
local cjson = require "cjson"
local db = require "lapis.db"

-- Local modules
local PG = require "services.PG"
local fmt = string.format

local function get_user(uid)
    return PG.query([[
        select id, nickname, profile, fame from "user" where id = ?
    ]], uid)[1]
end

local function get_article(article_id)
    return PG.query([[
        select id, title from "article" where id = ?
    ]], article_id)[1]
end

local function get_comment(comment_id)
    return PG.query([[
        select * from "comment" where id = ?
    ]], comment_id)[1]
end

local function create_comment(app)
    local ctx = app.ctx

    local uid = ctx.uid
    local user = get_user(uid)
    if not user then error("user.not.exists", 0) end

    local article_id = tonumber(app.params.article_id)
    if not article_id then error("article.not.exists", 0) end

    local article = get_article(article_id)
    if not article then error("article.not.exists", 0) end

    local refer_to = tonumber(app.params.refer_to)
    local reference = {}
    local reference_obj = {}

    if refer_to then
        reference = get_comment(refer_to)
        if reference then reference_obj = cjson.decode(reference.obj) end
    end

    local comment_obj = cjson.encode({
        reference_id = reference.id,
        reference_author = reference_obj.author,
        reference_profile = reference_obj.profile,
        reference_content = reference_obj.content,
        article_title = article.title,
        author = user.nickname,
        profile = user.profile,
        content = ngx.req.get_body_data()
    })

    local comment = {
        created_by = uid,
        article_id = article_id,
        refer_to = refer_to or 0,
        obj = db.raw(fmt("'%s'::jsonb", comment_obj))
    }

    PG.create("comment", comment, "id")

    return {status = 204}
end

return create_comment
