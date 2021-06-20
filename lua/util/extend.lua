-- @param {table} o
-- @param {table} t
local function extend(o, t)
    for k, v in pairs(t) do o[k] = v end

    return o
end

return extend
