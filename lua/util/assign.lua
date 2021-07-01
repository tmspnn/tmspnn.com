-- @param {table} o
-- @param {*} t
local function assign(o, t)
    if type(t) == "table" then for k, v in pairs(t) do o[k] = v end end
    return o
end

return assign
