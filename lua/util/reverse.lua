-- @param {string|itable} t
local function reverse(t)
    if type(t) == "string" then return string.reverse(t) end

    local tmp;

    for i = 1, math.floor(#t / 2) do
        tmp = t[i]
        t[i] = t[#t - i + 1]
        t[#t - i + 1] = tmp
    end

    return t
end

return reverse
