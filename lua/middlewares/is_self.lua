local function is_self(app)
    --[[ lapis.Application app --]]
    local uid = app.ctx.uid
    local uid_in_url = assert(to_number(app.params.user_id), "user_id.required")

    assert(uid == uid_in_url, "forbidden")
end

return is_self
