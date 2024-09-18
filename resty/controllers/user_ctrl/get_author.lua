local PG = require "services.PG"

local function get_user(author_id, uid)
    if uid then
        return PG.query([[
            select
                id, nickname, profile, gender, state, description, location, fame,
                articles_count, followings_count, followers_count, ratings_count,
                follower_ids @> array[?] as followed, obj->'bg_image' as bg_image
            from "user" where id = ?;
        ]], uid, author_id)[1]
    end

    return PG.query([[
        select
            id, nickname, profile, gender, state, description, location, fame,
            articles_count, followings_count, followers_count, ratings_count,
            false as followed, obj->'bg_image' as bg_image
        from "user" where id = ?;
    ]], author_id)[1]
end

local function get_articles(author_id)
    return PG.query([[
        select
            id, title, author, cover, round(rating, 1) as rating,
            ceil(wordcount::float / 500) as minutes
        from "article" where created_by = ? order by id desc limit 20;
    ]], author_id)
end

local function get_author(app)
    local ctx = app.ctx
    local author_id = assert(tonumber(app.params.author_id), "user.not.exists")
    local author = assert(get_user(author_id, ctx.uid), "user.not.exists")
    author.articles = get_articles(author.id)

    return {
        json = author
    }
end

return get_author
