local function assign(o, t)
    --[[
        Assign properties of t to o
        @param table o
        @param * t
        @returns table o
    --]]
    if type(t) == "table" then for k, v in pairs(t) do o[k] = v end end
    return o
end

return assign
