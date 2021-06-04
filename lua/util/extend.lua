local function extend(o, ...)
    for _, v in ipairs({...}) do
        if type(v) == "table" then
            for k, u in pairs(v) do
                o[k] = u
            end
        end
    end
end

return extend
