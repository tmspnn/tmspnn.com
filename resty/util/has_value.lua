local function has_value(t, v)
    --[[ table t --]]
    for _, value in pairs(t) do
        if value == v then
            return true
        end
    end

    return false
end

return has_value
