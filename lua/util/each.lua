-- @param {table} o
-- @param {function} f
local function each(o, f) for k, v in pairs(o) do f(v, k) end end

return each
