local util = {}

function util.keys(t)
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

function util.assign(target, ...)
    local params = {...}
    for _, p in ipairs(params) do
        for k, v in pairs(p) do
            target[k] = v
        end
    end
    return target
end

function util.has_key(t, k)
    return t[k] ~= nil
end

function util.has_value(t, v)
    for _, value in pairs(t) do
        if value == v then
            return true
        end
    end
    return false
end

function util.upper_case(s)
    return string.upper(s)
end

function util.lower_case(s)
    return string.lower(s)
end

function util.push_back(t, ...)
    local params = {...}
    for _, v in ipairs(params) do
        table.insert(t, v)
    end
end

function util.join(t, s)
    return table.concat(t, s)
end

function util.split(s, d)
    local t = {}
    local ptn = string.format("([^%s]+)", d)
    for w in string.gmatch(s, ptn) do
        table.insert(t, w)
    end
    return t
end

function util.map(t, f)
    local mapped = {}
    for k, v in pairs(t) do
        mapped[k] = f(v)
    end
    return mapped
end

return util
