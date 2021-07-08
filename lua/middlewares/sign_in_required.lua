local function sign_in_required(options)
    --[[
        boolean options.redirect
        string options.url
    --]]
    local redirect = (options and options.redirect) or false
    local url = (options and options.url) or "/sign-in"

    return function(app)
        if app.ctx.uid then return end

        if redirect then
            app:write({redirect_to = url})
        else
            error("not.authorized")
        end
    end
end

return sign_in_required
