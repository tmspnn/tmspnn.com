local function uniq(t)
    local h = {}
    local r = {}

    for k, v in pairs(t) do h[v] = k end
    for k, _ in pairs(h) do r[#r + 1] = k end

    return r
end

return uniq
