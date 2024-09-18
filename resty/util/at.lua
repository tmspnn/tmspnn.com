local function at(o, ...)
    --[[
        table o
        string|int ...
    --]]
    local r = o

    for _, p in ipairs({...}) do
        if r == nil then
            return nil
        end
        r = r[p]
    end

    return r
end

return at
