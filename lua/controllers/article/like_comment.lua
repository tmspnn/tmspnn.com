local User = require "models/user"
local Article = require "models/article"
local util = require "util"

-- TODO: handle exceptions

local function advocate(app, uid, article_id, comment_id)
    local ok1 = User:add_advocated_comment(uid, comment_id)
    local ok2 = Article:add_comment_advocator(comment_id, uid)

    if ok1 == 1 and ok2 == 1 then
        local ok = User:query(string.format([[
                begin;

                update "article" set advocators_count = advocators_count + 1 where id = %d;

                update "user"
                set fame = fame + 1
                from (select created_by from "article" where id = %d) a
                where id = a.created_by;

                commit;
            ]], article_id, article_id))

        if not ok then
            error("...")
        end

        app:write({
            status = 204
        })
    end
end

local function rev_advocate(app, uid, article_id, comment_id)
    local ok1 = User:remove_advocated_comment(uid, comment_id)
    local ok2 = Article:remove_comment_advocator(comment_id, uid)

    if ok1 == 1 and ok2 == 1 then
        local ok = User:query(string.format([[
                begin;

                update "article" set advocators_count = advocators_count - 1 where id = %d;

                update "user"
                set fame = fame - 1
                from (select created_by from "article" where id = %d) a
                where id = a.created_by;

                commit;
            ]], article_id, article_id))

        if not ok then
            error("...")
        end

        app:write({
            status = 204
        })
    end
end

local function oppose(app, uid, article_id, comment_id)
    local ok1 = User:add_opposed_comment(uid, comment_id)
    local ok2 = Article:add_comment_opposer(comment_id, uid)

    if ok1 == 1 and ok2 == 1 then
        local ok = User:query(string.format([[
                begin;

                update "article" set opposers_count = opposers_count + 1 where id = %d;

                update "user"
                set fame = fame - 1
                from (select created_by from "article" where id = %d) a
                where id = a.created_by;

                commit;
            ]], article_id, article_id))

        if not ok then
            error("...")
        end

        app:write({
            status = 204
        })
    end
end

local function rev_oppose(app, uid, article_id, comment_id)
    local ok1 = User:remove_opposed_comment(uid, comment_id)
    local ok2 = Article:remove_comment_opposer(comment_id, uid)

    if ok1 == 1 and ok2 == 1 then
        local ok = User:query(string.format([[
                begin;

                update "article" set opposers_count = opposers_count - 1 where id = %d;

                update "user"
                set fame = fame + 1
                from (select created_by from "article" where id = %d) a
                where id = a.created_by;

                commit;
            ]], article_id, article_id))

        if not ok then
            error("...")
        end

        app:write({
            status = 204
        })
    end
end

local function like_comment(app)
    local uid = app.ctx.uid
    local article_id = app.params.article_id
    local comment_id = app.params.comment_id
    local attitude = app.params.attitude -- advocate, oppose, rev_advocate, rev_oppose
    
    local res = {
        status = 200,
        json = {}
    }

    if not uid then
        local from = util.join({"/articles", article_id, "comments", comment_id, "attitudes"}, "/")
        return {
            redirect_to = "/sign-in?from = " .. app.ctx.escape(from)
        }
    end

    local current_user = User:find_by_id(uid)

    if current_user.fame <= 0 then
        res.status = 403
        res.json.err = "您的声望太低, 无法执行此操作"
        return res
    end

    -- TODO: add verifications & exceptions

    if attitude == "advocate" then
        return advocate(app, uid, article_id, comment_id)
    elseif attitude == "rev_advocate" then
        return rev_advocate(app, uid, article_id, comment_id)
    elseif attitude == "oppose" then
        return oppose(app, uid, article_id, comment_id)
    elseif attitude == "rev_oppose" then
        return rev_oppose(app, uid, article_id, comment_id)
    end

    res.status = 400
    res.json.err = "Unknown attitude."
    return res
end

return like_comment
