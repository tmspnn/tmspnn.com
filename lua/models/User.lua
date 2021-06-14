-- External modules
local ngx = require "ngx"
local basexx = require "basexx"
local cjson = require "cjson"
local date = require "date"
local sha1 = require "sha1"

-- Aliases
local fmt = string.format

-- Local modules
local Model = require "models.Model"
local redis_client = require "models.redis_client"

-- Implementation
local User = Model:new("user")

local token_ttl = 60 * 60 * 24 * 14 -- two weeks
local vcode_ttl = 60 * 10 -- ten minutes
-- local password_sequence_ttl = 60 * 60 * 24 -- one day

-- @param {string} user_token
-- @returns {double}
function User:get_id_by_token(user_token)
    local client = redis_client:new()
    local uid = client:run("get", fmt("user_token(%s):uid", user_token))
    return tonumber(uid)
end

-- @param {double} uid
-- @returns {string}
function User:generate_user_token(uid)
    local timestamp = os.time()
    local random_number = string.sub(math.random(), -4)
    return basexx.to_base64(uid .. ":" .. timestamp .. ":" .. random_number)
end

-- @param {string} token
-- @param {double} uid
function User:set_token(token, uid)
    local client = redis_client:new()
    client:run("setex", fmt("user_token(%s):uid", token), token_ttl, uid)
end

-- @param {string} token
function User:remove_token(token)
    local client = redis_client:new()
    client:run("del", fmt("user_token(%s):uid", token))
end

-- @param {string} mobile
function User:get_vcode(mobile)
    local client = redis_client:new()
    return client:run("get", fmt("mobile(%s):vcode", mobile))
end

-- @param {string} vcode
-- @param {string} mobile
function User:set_vcode(vcode, mobile)
    local client = redis_client:new()
    client:run("setex", fmt("mobile(%s):vcode", mobile), vcode_ttl, vcode)
end

-- @param {string} mobile
function User:remove_vcode(mobile)
    local client = redis_client:new()
    client:run("del", fmt("mobile(%s):vcode", mobile))
end

-- https://support.huaweicloud.com/api-obs/obs_04_0012.html
-- @param {double} uid
function User:generate_oss_upload_token(uid)
    local current_date = date()
    local expiration_date = current_date:adddays(1)
    local oss_policy = cjson.encode({
        expiration = expiration_date:fmt("${iso}Z"),
        conditions = {
            {["x-obs-acl"] = "public-read"}, {["bucket"] = "tmspnn"},
            {"starts-with", "$key", "public/users/" .. uid},
            {"starts-with", "$Content-Type", ""},
            {"starts-with", "$Cache-Control", ""}
        }
    })
    local string_to_sign = basexx.to_base64(oss_policy)
    local signature = basexx.to_base64(sha1.hmac_binary(ngx.var.oss_secret_key,
                                                        string_to_sign))
    return string_to_sign, signature
end

-- @param {double} uid
function User:get_advocated_comments(uid)
    return self:find([[
        obj->'advocated_comments' from "user" where id = ?
    ]], uid)[1]
end

function User:get_hot_authors_24h()
    return self:query([[
        select
            id, nickname, profile, fame, gender, location, articles_count,
            followings_count, followers_count
        from  "user"
        where created_at > now() - interval '1 day'
        order by fame desc limit 20
    ]])
end

function User:get_hot_authors_overall()
    return self:query([[
        select
            id, nickname, profile, fame, gender, location, articles_count,
            followings_count, followers_count
        from  "user"
        order by fame desc limit 20
    ]])
end

-- function user:get_recommended()
--     return self:find([[ * from "user" order by id desc limit 5 ]])
-- end

-- function user:get_password_sequence(email)
--     local client = redis_client:new()
--     return client:run("get", fmt("email(%s):password_sequence", email))
-- end

-- function user:set_password_sequence(sequence, email)
--     local client = redis_client:new()
--     client:run("setex", fmt("email(%s):password_sequence", email), password_sequence_ttl, sequence)
-- end

-- function user:remove_password_sequence(sequence, email)
--     local client = redis_client:new()
--     return client:run("del", fmt("email(%s):password_sequence", email))
-- end

-- function user:add_follower(uid, follower_id)
--     local client = redis_client:new()
--     client:run("zadd", fmt("uid(%d):followers", uid), util.timestamp(), follower_id)
--     self:update({
--         followers_count = db.raw("followers_count + 1")
--     }, "id = ?", uid)
-- end

-- function user:remove_follower(uid, follower_id)
--     local client = redis_client:new()
--     client:run("zrem", fmt("uid(%d):followers", uid), follower_id)
--     self:update({
--         followers_count = db.raw("followers_count - 1")
--     }, "id = ?", uid)
-- end

-- function user:add_following(uid, following_id)
--     local client = redis_client:new()
--     client:run("zadd", fmt("uid(%d):followings", uid), util.timestamp(), following_id)
--     self:update({
--         followings_count = db.raw("followings_count + 1")
--     }, "id = ?", uid)
-- end

-- function user:remove_following(uid, following_id)
--     local client = redis_client:new()
--     client:run("zrem", fmt("uid(%d):followings", uid), following_id)
--     self:update({
--         followings_count = db.raw("followings_count - 1")
--     }, "id = ?", uid)
-- end

-- function user:add_advocated_comment(uid, comment_id)
--     local client = redis_client:new()
--     return client:run("zadd", fmt("uid(%d):advocated_comments", uid), util.timestamp(), comment_id)
-- end

-- function user:check_advocated_comment(uid, comment_id)
--     local client = redis_client:new()
--     return client:run("zscore", fmt("uid(%d):advocated_comments", uid), comment_id) ~= nil
-- end

-- function user:check_advocated_comments(uid, comment_ids)
--     local client = redis_client:new()
--     return client:run("eval", [[
--         local res = {}
--         for _, v in ipairs(ARGV) do
--             res[#res + 1] = redis.call("zscore", KEYS[1], v)
--         end
--         return res
--     ]], 1, fmt("uid(%d):advocated_comments", uid), unpack(comment_ids))
-- end

-- function user:remove_advocated_comment(uid, comment_id)
--     local client = redis_client:new()
--     return client:run("zrem", fmt("uid(%d):advocated_comments", uid), comment_id)
-- end

-- function user:add_opposed_comment(uid, comment_id)
--     local client = redis_client:new()
--     return client:run("zadd", fmt("uid(%d):opposed_comments", uid), util.timestamp(), comment_id)
-- end

-- function user:remove_opposed_comment(uid, comment_id)
--     local client = redis_client:new()
--     return client:run("zrem", fmt("uid(%d):opposed_comments", uid), comment_id)
-- end

-- function user:get_following_ids(uid, offset)
--     if not offset then
--         offset = 0
--     end
--     local client = redis_client:new()
--     return client:run("zrevrangebyscore", fmt("uid(%d):followings", uid), "+inf", 0, "limit", offset, 20)
-- end

-- function user:get_follower_ids(uid, offset)
--     if not offset then
--         offset = 0
--     end
--     local client = redis_client:new()
--     return client:run("zrevrangebyscore", fmt("uid(%d):followers", uid), "+inf", 0, "limit", offset, 20)
-- end

-- function user:add_rated_article(uid, article_id, rating)
--     local client = redis_client:new()
--     return client:run("zadd", fmt("uid(%d):rated_articles", uid), rating, article_id)
-- end

return User
