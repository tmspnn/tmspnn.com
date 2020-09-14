local util = {}

-- @required t: table
function util.get_table_keys(t)
    local keys = {}
    for k, v in pairs(t) do
        table.insert(keys, k)
    end
    table.sort(keys)
    return keys
end

function util.camel_case(s)
    return s:gsub("_(%w)", function(o)
        return o:upper()
    end)
end

function util.snake_case(s)
    return s:gsub("[a-z]([A-Z])", function(o)
        return "_" .. o:lower()
    end)
end

return util
