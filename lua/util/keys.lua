local function keys(o)
    local r = {}

    if type(o) ~= "table" then
        return r
    end

    for k, _ in pairs(o) do
        r[#r + 1] = k
    end

    return r
end

return keys
