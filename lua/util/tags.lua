local cjson = require "cjson"
local fmt = string.format

--[[
    {
        string ASSETS_PREFIX,
        string MAINLINE_VERSION,

        {
            string tag,
            { string type, string rel, string href } attributes
        } css,

        {
            string tag,
            { string type, string src } attributes
        } js,

        {
            string tag,
            string inner_html,
            { string type } attributes
        } json
    } tags
--]]

local tags = {ASSETS_PREFIX = "", MAINLINE_VERSION = "1.0.0"}

function tags:css(filename, version)
    return {
        tag = "link",
        attributes = {
            type = "text/css",
            rel = "stylesheet",
            href = fmt("%s/%s-%s.css", self.ASSETS_PREFIX, filename,
                       version or self.MAINLINE_VERSION)
        }
    }
end

function tags:js(filename, version)
    return {
        tag = "script",
        attributes = {
            type = "text/javascript",
            src = fmt("%s/%s-%s.js", self.ASSETS_PREFIX, filename,
                      version or self.MAINLINE_VERSION)
        }
    }
end

function tags:json(data)
    return {
        tag = "script",
        attributes = {type = "application/json"},
        inner_html = cjson.encode(data)
    }
end

return tags
