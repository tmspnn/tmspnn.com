-- External modules
local ngx = require("ngx")

-- Local modules
local Article = require("models/article")
local User = require("models/user")
local errors = require("models/error_messages")
local util = require("util")
local redis_client = require("models/redis_client")

-- Static variables
local article_not_exists = {
    status = 400,
    json = {err = errors["article.not.exists"]}
}

local stars_count_invalid = {
    status = 400,
    json = {err = errors["stars_count.invalid"]}
}

local duplicate_rating = {
    status = 400,
    json = {err = errors["duplicate.rating"]}
}

local default_error = {status = 500, json = {err = errors.default}}

-- Module
local function rate_article(app)
    local ctx = app.ctx
    local uid = ctx.uid

    -- Authentication
    if not uid then
        local from_url = ctx.escape("/articles/" .. app.params.article_id)
        return {redirect_to = "/sign-in?from=" .. from_url}
    end

    -- Validate params
    local article_id = tonumber(app.params.article_id)

    if not article_id then return article_not_exists end

    local stars_count = tonumber(app.params.starsCount) -- one to five

    if not (stars_count > 0 and stars_count <= 5) then
        return stars_count_invalid
    end

    -- Check article existance
    local article = Article:find_by_id(article_id)

    if not article then return article_not_exists end

    -- In case of duplicate rating
    local my_rating = Article:get_rating_by_uid(article_id, uid)

    if my_rating then return duplicate_rating end

    -- Update db
    local author_id = article.created_by

    local pg_res = Article:query(string.format([[
        begin;
        set local lock_timeout = '1s';

        select pg_advisory_xact_lock(0, %d);

        insert into rating (article_id, article_title, article_author, created_by, author, with_fame, value)
        select a.id as article_id, a.title as article_title, a.author as article_author, u.id as created_by, u.nickname as author, u.fame as with_fame, %d as value
        from "article" a, "user" u
        where a.id = %d and u.id = %d;

        update "article" a
        set
            rating = (rating * weight + %d * rater.fame) / (weight + rater.fame),
            weight = weight + rater.fame,
            updated_at = now()
        from "user" rater
        where a.id = %d and rater.id = %d;

        update "user"
        set
            fame = fame + (%d - 3) * least(greatest(1, rater_fame / fame), 50)
        from (select fame as rater_fame from "user" where id = %d) rater
        where id = %d;

        commit;
        ]], article_id, stars_count, article_id, uid, stars_count, article_id,
                                               uid, stars_count, uid, author_id))

    if not pg_res then return default_error end

    User:add_rated_article(uid, article_id, stars_count)
    Article:add_rater(article_id, uid, stars_count)

    app:write({status = 204})
end

return rate_article
