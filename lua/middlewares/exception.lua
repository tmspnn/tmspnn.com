-- External modules
local ngx = require("ngx") -- Provided by OpenResty

-- Local modules
local error_messages = require("models/error_messages")

-- Implementation
local exception = {}

function exception.handle_404()
    return {
        status = 404,
        render = "pages.404"
    }
end

function exception.handle_error(app, err, trace)
    -- app: lapis.Application
    -- err: string
    -- trace: string
    local msg = error_messages[err]

    if not msg then
        ngx.log(ngx.ERR, err, trace) 
        msg = error_messages["default"]
    end

    return {
        status = msg.status,
        json = { err = msg.message }
    }
end

return exception
