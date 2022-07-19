local cjson = require "cjson"
local PG = require "services.PG"
local redis_client = require "services.redis_client"

local function get_feed_ids(uid, offset)
    local client = redis_client:new()
    return client:run("zrevrange", fmt("uid(%d):followings", uid), offset, offset + 19)
end

local function get_feeds(app)
    local ctx = app.ctx
    local offset = tonumber(app.params.offset) or 0
    local feed_ids = get_feed_ids(ctx.uid, offset)

    if #feed_ids == 0 then
        return {
            json = cjson.empty_array
        }
    end

    local feeds = PG.query([[
        select
            id, title, author, cover, round(rating, 1) as rating,
            ceil(wordcount::float / 500) as minutes
        from "article" where id in ?;
    ]], db.list(feed_ids))

    return {
        json = #feeds == 0 and cjson.empty_array or feeds
    }
end

return get_feeds
