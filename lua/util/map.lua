-- @param {table} o
-- @param {function} f
local function map(o, f)
    local r = {}

    if o[1] == nil then
        for k, v in pairs(o) do r[k] = f(v, k) end
    else
        for i, v in ipairs(o) do r[i] = f(v, i) end
    end

    return r
end

return map
