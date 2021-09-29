local cjson = require "cjson"
--
local PG = require "services.PG"
local empty = require "util.empty"

local function get_articles(app)
    local articles

    if app.params.order_by == "fame" then
        local fame = assert(tonumber(app.params.fame), "fame.required")
        articles = PG.query([[
            select
                id, title, author, cover, rating, obj->'tags' as tags,
                ceil(wordcount::float / 500) as minutes
            from "article" where fame < ? order by fame desc limit 20;
        ]], fame)
    else
        local id = assert(tonumber(app.params.id), "id.required")
        articles = PG.query([[
            select
                id, title, author, cover, rating, obj->'tags' as tags,
                ceil(wordcount::float / 500) as minutes
            from "article" where id < ? order by id desc limit 20;
        ]], id)
    end

    return empty(articles) and cjson.empty_array or articles
end

return get_articles
