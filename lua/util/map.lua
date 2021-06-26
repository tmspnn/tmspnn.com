-- @param {table} o
-- @param {function} f
local function map(o, f)
    local r = {}

    for k, v in pairs(o) do r[k] = f(v, k) end

    return r
end

return map
