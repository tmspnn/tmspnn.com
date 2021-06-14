-- @param {string} s
local function trim(s) return s:match("^%s+(.*)%s+$") end

return trim
