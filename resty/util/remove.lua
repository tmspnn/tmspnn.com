-- @param {table} o
-- @param {any} val
local function remove(o, ...)
    for _, v in ipairs({...}) do
        for j, u in pairs(o) do if u == v then o[j] = nil end end
    end
end

return remove
