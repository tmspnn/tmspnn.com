local function filter(o, f)
    local r = {}

    for k, v in pairs(o) do if f(v, k) then r[k] = v end end

    return r
end

return filter
