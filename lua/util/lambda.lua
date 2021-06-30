-- @param {string} params
-- @param {string} returns
local function lambda(params, returns)
    local func_str = string.format([[
        return function (%s) return %s end
    ]], params, returns)

    return assert(loadstring(func_str))()
end

return lambda
