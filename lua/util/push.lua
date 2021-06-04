local function push(o, ...)
    for i, v in ipairs({...}) do
        o[#o + i] = v
    end
end

return push
