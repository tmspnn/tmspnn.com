local Article = require "models/article"
local User = require "models/user"
local util = require "util"

local function rate_article(app)
    local ctx = app.ctx
    local article_id = tonumber(app.params.articleId)
    local stars_count = tonumber(app.params.starsCount) -- one to five
    local res = {
        status = nil,
        json = {
            err = nil
        }
    }

    if not ctx.uid then
        return {
            redirect_to = "/sign-in?from=" .. ctx.escape("/articles/" .. article_id)
        }
    end

    -- TODO: check inputs & handle exceptions

    local current_article = Article:find_by_id(article_id)
    local author_id = current_article.created_by

    local pg_res = Article:query(string.format([[
        begin;
        set local lock_timeout = '1s';

        select pg_advisory_xact_lock(0, %d);

        insert into rating (article_id, article_title, article_author, created_by, with_fame, value)
        select a.id as article_id, a.title as article_title, a.author as article_author, u.id as created_by, u.fame as with_fame, %d as value
        from "article" a, "user" u
        where a.id = %d and u.id = %d;

        update "article" a
        set
            rating = (rating * weight + %d * rater.fame) / (weight + rater.fame),
            weight = weight + rater.fame
        from "user" rater
        where a.id = %d and rater.id = %d;

        update "user"
        set
            fame = fame + (%d - 3) * least(greatest(1, rater_fame / fame), 50)
        from (select fame as rater_fame from "user" where id = %d) rater
        where id = %d;

        commit;
        ]], article_id, stars_count, article_id, ctx.uid, stars_count, article_id, ctx.uid, stars_count, ctx.uid,
                                     author_id))

    if not pg_res then
        res.status = 500
        res.json.err = "Internal error."
        return res
    end

    app:write({
        status = 204
    })
end

return rate_article
