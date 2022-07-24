local function map(o, f)
    --[[
        table o
        function f
    --]]
    local r = {}

    for k, v in pairs(o) do
        r[k] = f(v, k)
    end

    return r
end

return map
