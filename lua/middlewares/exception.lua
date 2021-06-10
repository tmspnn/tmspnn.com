-- External modules
local ngx = require "ngx"

-- Local modules
local error_messages = require "models.error_messages"

-- Implementation
local exception = {}

function exception.handle_404() return {status = 404, render = "pages.404"} end

-- @param {lapis.Application} app
-- @param {string} err
-- @param {string} trace
function exception.handle_error(app, err, trace)
    local msg = error_messages[err]

    if not msg then
        ngx.log(ngx.ERR, err, trace)
        msg = error_messages["default"]
    end

    return {status = msg.status, json = {err = msg.message}}
end

return exception
