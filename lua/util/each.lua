local function each(o, f)
    --[[
        table o
        void f(* v, number|string k)
    --]]
    for k, v in pairs(o) do f(v, k) end
end

return each
