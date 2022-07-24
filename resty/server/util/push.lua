local function push(o, ...)
    --[[ table o --]]
    for i, v in ipairs({...}) do
        o[#o + i] = v
    end
end

return push
