local util = require "util"
local Article = require "models/article"

local function get_articles(app)
    local latest = tonumber(app.params.latest) or 2e9
    local limit_count = tonumber(app.params.limit) or 20

    if limit_count > 100 then limit_count = 100 end

    local current_articles = Article:find(
                                 "* from \"article\" where id < ? order by id desc limit ?",
                                 latest, limit_count)

    local feed_template_fun = require "views/components/feed"

    local htmls = util.map(current_articles, function(a)
        app.ctx.data = a
        local template = feed_template_fun({ctx = app.ctx})
        return template:render_to_string()
    end)

    return {json = {data = current_articles, html = util.join(htmls, "")}}
end

return get_articles
