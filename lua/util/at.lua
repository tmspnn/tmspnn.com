-- @param { table } o
local function at(o, ...)
    local r = o

    for _, p in ipairs({...}) do
        if r == nil then break end
        r = r[p]
    end

    return r
end

return at
