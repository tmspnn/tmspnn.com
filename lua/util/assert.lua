local function assert(...)
    local r = {...}

    if not r[1] then error(r[2] or "assert: Assertion Failed") end

    return ...
end

return assert
