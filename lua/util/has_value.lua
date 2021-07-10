local function has_value(t, v)
    --[[
        Check if table contains value.
        @param table t
        @param * v
        @returns boolean
    --]]
    for _, value in pairs(t) do if value == v then return true end end
    return false
end

return has_value
