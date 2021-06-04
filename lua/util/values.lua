local function values(o)
    local r = {}

    if type(o) ~= "table" then
        return r
    end

    for _, v in pairs(o) do
        r[#r + 1] = v
    end

    return r
end

return values
