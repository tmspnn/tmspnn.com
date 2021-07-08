local ngx = require "ngx"
--
local error_messages = require "controllers.error_messages"
--
local exception = {}

function exception.handle_404() return {status = 404, render = "pages.404"} end

function exception.handle_error(app, err, trace)
    --[[
        lapis.Application app
        string err
        string trace
    --]]
    local space_idx = err:find(" ")
    local error_txt = err:sub(space_idx + 1)
    local msg = error_messages[error_txt]

    if not msg then
        ngx.log(ngx.ERR, err, trace)
        msg = error_messages["default"]
    end

    return {status = msg.status, json = {err = msg.message}}
end

return exception
