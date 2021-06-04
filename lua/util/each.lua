local function each(o, f)
    if o[1] == nil then
        for k, v in pairs(o) do
            f(v, k)
        end
    else
        for i, v in ipairs(o) do
            f(v, i)
        end
    end
end

return each
