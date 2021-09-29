local cjson = require "cjson"
local db = require "lapis.db"
--
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
    local ctx = app.ctx
    local user = get_user(ctx.uid)
    local rating = assert(tonumber(app.params.rating), "rating.invalid")
    assert(rating > 0 and rating < 6, "rating.invalid")
    local article_id = assert(tpnumber(app.params.article_id), "article.not.exists")
    local article = assert(get_article(article_id), "article.not.exists")
    local obj = fmt("'%s'::jsonb", cjson.encode {
        author = user.nickname,
        author_profile = user.profile,
        article_id = article_id,
        article_title = article.title
    })

    PG.query([[
        begin;

        set local lock_timeout = '1s';

        select pg_advisory_xact_lock(0);

        insert into rating
            (created_by, article_id, rating, weight, obj)
        values
            (?, ?, ?, ?, ?);

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

        update "user"
        set
            ratings_count = ratings_count + 1
        where id = ?;

        commit;
    ]], ctx.uid, article_id, rating, user.fame, db.raw(obj), rating, user.fame, user.fame, user.fame, rating, user.fame,
        article_id, rating, user.fame, article.created_by, ctx.uid)

    return {
        status = 204
    }
end

return rate_article
