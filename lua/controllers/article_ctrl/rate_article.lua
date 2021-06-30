-- External modules
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
        select id, created_by, title from "article" where id = ?
    ]], article_id)[1]
end

local function rate_article(app)
    local uid = app.ctx.uid

    local rating = tonumber(app.params.rating)

    if not rating or rating < 1 or rating > 5 then error("rating.invalid", 0) end

    local referrer = app.req.headers["referer"]
    local starts, ends, article_id_str =
        string.find(referrer, "/articles/(%d+)")
    local article_id = tonumber(article_id_str)

    if not article_id then error("article.not.exists", 0) end

    local user = get_user(uid)

    local article = get_article(article_id)

    local rating_obj = cjson.encode({
        author = user.nickname,
        author_profile = user.profile,
        article_title = article.title
    })

    assert(PG.query([[
        begin;

        set local lock_timeout = '1s';

        select pg_advisory_xact_lock(0);

        insert into rating (created_by, article_id, rating, weight, obj)
        values (?, ?, ?, ?, ?);

        update "article"
        set
            rating = (rating * weight + ? * ?) / (weight + ?),
            weight = weight + ?,
            fame = rating * weight + (? - 3) * ?
        where id = ?;

        update "user"
        set
            fame = fame + (? - 3) * least(greatest(1, ? / fame), 50)
        where id = ?;

        commit;
    ]], uid, article_id, rating, user.fame,
                    db.raw(fmt("'%s'::jsonb", rating_obj)), rating, user.fame,
                    user.fame, user.fame, rating, user.fame, article_id, rating,
                    user.fame, article.created_by))

    return {status = 204}
end

return rate_article
