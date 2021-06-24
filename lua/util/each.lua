-- @param {table} o
-- @param {function} f
local function each(o, f)
    if o[1] == nil then
        for k, v in pairs(o) do f(v, k) end
    else
        for i = 1, table.maxn(o) do f(o[i], i) end
    end
end

return each
