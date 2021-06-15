-- @param {any} t
local function empty(t)
    if type(t) == "table" then for _, _ in pairs(t) do return false end end

    return true
end

return empty
