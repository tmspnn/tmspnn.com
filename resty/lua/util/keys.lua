-- @param {table} o
local function keys(o)
    local r = {}

    for k, _ in pairs(o) do r[#r + 1] = k end

    return r
end

return keys
