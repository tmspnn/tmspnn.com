local at = require "util.at"

local function sign_in_required(options)
    --[[
        bool options.redirect
        string options.url
    --]]
    local redirect = at(options, "redirect")
    local url = at(options, "url") or "/sign-in"

    return function(app)
        --[[ lapis.Application app --]]
        local uid = app.ctx.uid

        if uid then
            return
        end

        if redirect then
            app:write({
                redirect_to = url
            })
        else
            error("not.authorized")
        end
    end
end

return sign_in_required
