-- External modules
local cjson = require "cjson"
local ngx = require "ngx"

-- Local modules
local Article = require "models.Article"
local each = require "util.each"

local function search(app)
    local text = app.params.text

    -- Tokenization
    ngx.req.set_header("Content-Type", "application/json")
    local tok_res = ngx.location.capture("/internal/nlp/tokenization", {
        method = ngx.HTTP_POST,
        body = cjson.encode({text = text})
    })

    if tok_res.status ~= 200 then error(tok_res.body) end

    local tokens = cjson.decode(tok_res.body)["tok/fine"][1]

    local articles = Article:search(tokens)
    local feed_template_fun = require("views.components.feed")

    each(articles,
         function(a) a.html = feed_template_fun(a):render_to_string() end)

    return {json = {articles = articles}}
end

local function search_controller(app) app:get("/api/search", search) end

return search_controller
