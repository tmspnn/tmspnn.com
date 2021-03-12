-- External modules
local ngx = require("ngx")

-- Local modules
local User = require("models/user")
local Article = require("models/article")
local Comment = require("models/comment")
local util = require("util")
local redis_client = require("models/redis_client")

local function post_advocate(_, advocator_id, comment_id)
    local comment = Comment:find_by_id(comment_id)
    Article:set_hot_comment(comment.article_id, comment_id, comment.advocators_count)
    User:add_advocated_comment(advocator_id, comment_id)
end

local function advocate(app, uid, comment_id)
    local already_advocated = User:check_advocated_comment(uid, comment_id)
    
    if already_advocated then
        error("duplicated.advocation", 0)
    end

    local comment = Comment:find_by_id(comment_id)

    if not comment then
        error("comment.not.exists", 0)
    end

    Comment:query([[
        begin;

        update "comment" set advocators_count = advocators_count + 1 where id = ?;

        update "user" set fame = fame + 1 where id = ?;

        commit;
    ]], comment_id, comment.created_by)

    ngx.timer.at(0, post_advocate, uid, comment_id)
    
    app:write({ status = 204 })
end

local function post_rev_advocate(_, rev_advocator_id, comment_id)
    local comment = Comment:find_by_id(comment_id)

    if comment.advocators_count > 0 then
        Article:set_hot_comment(comment.article_id, comment_id, comment.advocators_count)
    else
        Article:reomve_hot_comment(comment.article_id, comment_id)
    end
    
    User:remove_advocated_comment(uid, comment_id)
end

local function rev_advocate(app, uid, comment_id)
    local comment = Comment:find_by_id(comment_id)

    if not comment then
        app.status = 400
        error("comment.not.exists")
    end

    Comment:query([[
    begin;

        update "comment" set advocators_count = advocators_count - 1 where id = ?;

        update "user" set fame = fame - 1 where id = ?;

        commit;
    ]], comment_id, comment.created_by)

    ngx.timer.at(0, post_rev_advocate, uid, comment_id)

    app:write({ status = 204 })
end

local function like_comment(app)
    local uid = app.ctx.uid
    local comment_id = tonumber(app.params.comment_id)
    local attitude = app.params.attitude -- advocate, rev_advocate

    -- Authentication
    if not uid then return { redirect_to = "/sign_in" } end

    -- Validation of parameters
    if not comment_id then
        app.status = 400
        error("comment.not.exists")
    end

    local user = User:find_by_id(uid)

    if user.fame <= 0 then
        app.status = 403
        error("fame.too.low")
    end

    if attitude == "advocate" then
        return advocate(app, uid, comment_id)
    elseif attitude == "rev_advocate" then
        return rev_advocate(app, uid, comment_id)
    else
        app.status = 400
        error("unknown.attitude")
    end
end

return like_comment
