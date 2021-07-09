local ngx = require "ngx"
local db = require "lapis.db"
--
local PG = require "services.PG"
local empty = require "util.empty"

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

    local blocks = app.params.blocks
    if empty(blocks) then error("empty.content") end

    local user = assert(get_user(ctx.uid), "user.not.exists")
    local article = assert(get_article(tonumber(app.params.article_id)),
                           "article.not.exists")
    local refer_to = tonumber(app.params.refer_to)
    local reference_author = ""
    local reference_author_profile = ""
    local reference_content = ""
    local reference_created_at = db.raw("now()")

    if refer_to then
        local reference = get_comment(refer_to)
        if reference then
            reference_author = reference.author
            reference_author_profile = reference.author_profile
            reference_content = reference.content
            reference_created_at = reference.created_at
        end
    end

    local d = {
        created_by = user.id,
        author = user.nickname,
        author_profile = user.profile,
        article_id = article.id,
        article_title = article.title,
        refer_to = refer_to or 0,
        reference_author = reference_author or "",
        reference_author_profile = reference_author_profile or "",
        reference_content = reference_content or "",
        reference_created_at = reference_created_at,
        content = ngx.req.get_body_data()
    }

    PG.create("comment", d)

    return {status = 204}
end

return create_comment
