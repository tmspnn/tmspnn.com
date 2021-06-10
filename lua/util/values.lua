-- @param {table} o
local function values(o)
    local r = {}

    for _, v in pairs(o) do r[#r + 1] = v end

    return r
end

return values
