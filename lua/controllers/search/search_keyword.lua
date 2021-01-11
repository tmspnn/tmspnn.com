-- @External packages
local ngx = require "ngx" -- The Nginx interface provided by OpenResty

-- @Local modules
local util = require "util"
local Article = require "models/article"
local User = require "models/user"

-- @Implementation
local function search_keyword(app)
    local ctx = app.ctx
    local keyword = app.params.keyword

    local res = ngx.location.capture("/proxy-search/" .. "search?keyword=" ..
                                         ctx.escape(keyword))

    if res.status ~= 200 then
        error(res.status .. ": Search service error. keyword = " .. keyword)
    end

    local res_body = ctx.from_json(res.body)
    local article_ids = res_body.articleIds
    local user_ids = res_body.userIds
    local similar_keys = res_body.similarKeywords

    local results = {data = {}, html = ""}

    if #article_ids > 0 then
        local articles = Article:find(
                             "select id, title from \"article\" where id in ?",
                             article_ids)

        for _, a in ipairs(articles) do
            util.push_back(results.data, {
                type = "article",
                id = a.id,
                title = a.title,
                rating = a.rating,
                weight = a.weight,
                summary = a.summary
            })
        end
    end

    if #user_ids > 0 then
        local users = User:find("select id, title from \"user\" where id in ?",
                                user_ids)

        for _, u in ipairs(users) do
            util.push_back(results.data, {
                type = "user",
                id = u.id,
                nickname = u.nickname,
                profile = u.profile,
                articles_count = u.articles_count,
                fame = u.fame
            })
        end
    end

    if #similar_keys > 0 then
        for _, key in ipairs(similar_keys) do
            util.push_back(results.data, {
                type = "topic",
                title = string.match(key, "keyword%(([^)]+)%)")
            })
        end
    end

    ctx.data = results.data

    -- Dynamic rendering, must be required locally
    local results_template_fun = require "views/components/search_results"
    local template = results_template_fun({ctx = ctx})

    results.html = template:render_to_string()

    return {json = results}
end

return search_keyword
