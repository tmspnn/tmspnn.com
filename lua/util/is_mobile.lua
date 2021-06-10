-- @param {string} s
local function is_mobile(s)
    return string.match(s, "1[34578]%d%d%d%d%d%d%d%d%d") ~= nil
end

return is_mobile
