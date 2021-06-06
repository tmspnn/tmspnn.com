-- @param {function} f
local function assert(f, ...)
    local r = {f(...)}

    if not r[1] then
        error(r[2] or "assert: Assertion Failed")
    end

    return unpack(r)
end

return assert
