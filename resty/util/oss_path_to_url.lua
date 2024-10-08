local get_oss_auth_key = require "util.get_oss_auth_key"

local function oss_path_to_url(oss_path)
    if type(oss_path) ~= "string" then
        return ""
    end

    if oss_path == "" or oss_path:sub(0, 4) == "http" then
        return oss_path
    end

    return "https://oss.tmspnn.com/" .. oss_path .. "?auth_key=" .. get_oss_auth_key(oss_path)
end

return oss_path_to_url
