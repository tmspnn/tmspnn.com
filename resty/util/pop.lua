-- @param {o} itable
local function pop(o)
    local r = o[#o]
    o[#o] = nil
    return r
end

return pop
