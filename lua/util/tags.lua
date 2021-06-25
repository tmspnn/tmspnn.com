-- External modules
local cjson = require "cjson"

-- Local modules and aliases
local fmt = string.format

-- Implementation
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
