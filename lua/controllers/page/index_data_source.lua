-- External modules
local date = require "date"

-- Local modules
local Article = require "models/article"
local User = require "models/user"
local util = require "util"

local function index_data_source(app)
    local uid = app.ctx.uid
    local latest_feeds = Article:get_latest()
    local recommended_authors = User:get_recommended()
    local recommended_topics = Article:get_recommended_topics()

    for _, fd in ipairs(latest_feeds) do
        fd.created_at = date(fd.created_at):fmt("%Y/%m/%d %H:%M")
        fd.keywords = util.split(fd.keywords, ",")
    end

    for i = 1, 10 do
        util.push_back(latest_feeds, latest_feeds[1])
    end

    return {
        page_name = "index",
        page_title = "拾刻阅读 | 首页",
        user = {
            id = uid
        },
        feeds = latest_feeds,
        recommended_authors = recommended_authors,
        recommended_topics = recommended_topics,
        recommended_keywords = {{
            type = "article",
            link = "/articles/7",
            texts = "木兰第一章"
        }, {
            type = "user",
            link = "/users/10007",
            texts = "木兰花下人"
        }, {
            type = "topic",
            link = "/topics/" .. app.ctx.escape("南北朝"),
            texts = "南北朝"
        }}
    }
end

return index_data_source
