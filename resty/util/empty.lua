local function empty(t)
    if type(t) == "table" then
        for k, v in pairs(t) do
            return false
        end
    end

    return true
end

return empty
