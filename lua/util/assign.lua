-- @param {table} o
-- @param {*} t
local function assign(o, t)
    if type(t) ~= "table" then return end

    for k, v in pairs(t) do o[k] = v end

    return o
end

return assign
