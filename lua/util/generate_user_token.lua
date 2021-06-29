local basexx = require "basexx"

local function generate_user_token(uid)
    local timestamp = os.time()
    local random_number = string.sub(math.random(), -4)
    return basexx.to_base64(uid .. ":" .. timestamp .. ":" .. random_number)
end

return generate_user_token
