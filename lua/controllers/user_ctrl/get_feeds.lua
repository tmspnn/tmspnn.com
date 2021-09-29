local cjson = require "cjson"
--
local PG = require "services.PG"

local function get_feeds(app)
    local ctx = app.ctx
    local offset = assert(tonumber(app.params.offset), "offset.required")

    local feed_ids = PG.query([[
        select
            feed_ids[createst(array_upper(feed_ids, 1) - ?, 1) : ?]
        from "user" where id = ?;
    ]], 19 + offset, offset, ctx.uid)[1].following_ids

    if #feed_ids == 0 then
        return {
            json = cjson.empty_array
        }
    end

    local feeds = PG.query([[
        select
            id, title, author, cover, rating, obj->'tags' as tags,
            ceil(wordcount::float / 500) as minutes
        from "article" where id in ?;
    ]], db.list(feed_ids))

    return {
        json = #feeds == 0 and cjson.empty_array or feeds
    }
end

return get_feeds
