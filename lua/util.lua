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

return util
