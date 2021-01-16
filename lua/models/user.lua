-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local basexx = require "basexx"
local date = require "date"
local db = require "lapis.db"
local lapis_util = require "lapis.util"
local to_json = lapis_util.to_json
local sha1 = require "sha1"

-- Local modules
local model = require "models/model"
local redis_client = require "models/redis_client"
local util = require "util"

local user = model:new("user")

local token_ttl = 60 * 60 * 24 * 14 -- two weeks
local vcode_ttl = 60 * 10 -- ten minutes
local password_sequence_ttl = 60 * 60 * 24 -- one day

function user:get_id_by_token(user_token)
    local client = redis_client:new()
    local uid = client:run("get",
                           string.format("user_token(%s):uid", user_token))
    return tonumber(uid)
end

function user:get_recommended()
    return self:find("* from \"user\" order by id desc limit 5")
end

function user:set_token(token, uid)
    local client = redis_client:new()
    client:run("setex", string.format("user_token(%s):uid", token), token_ttl,
               uid)
end

function user:get_vcode(email)
    local client = redis_client:new()
    return client:run("get", string.format("email(%s):vcode", email))
end

function user:set_vcode(vcode, email)
    local client = redis_client:new()
    client:run("setex", string.format("email(%s):vcode", email), vcode_ttl,
               vcode)
end

function user:remove_vcode(email)
    local client = redis_client:new()
    client:run("del", string.format("email(%s):vcode", email))
end

function user:get_password_sequence(email)
    local client = redis_client:new()
    return
        client:run("get", string.format("email(%s):password_sequence", email))
end

function user:set_password_sequence(sequence, email)
    local client = redis_client:new()
    client:run("setex", string.format("email(%s):password_sequence", email),
               password_sequence_ttl, sequence)
end

function user:remove_password_sequence(sequence, email)
    local client = redis_client:new()
    return
        client:run("del", string.format("email(%s):password_sequence", email))
end

function user:generate_oss_upload_token(uid)
    -- https://support.huaweicloud.com/api-obs/obs_04_0012.html
    local current_date = date()
    local expiration_date = current_date:adddays(1)
    local oss_policy = to_json({
        expiration = expiration_date:fmt("${iso}Z"),
        conditions = {
            {["x-obs-acl"] = "public-read"}, {["bucket"] = "tmspnn"},
            {"starts-with", "$key", "public/users/" .. uid},
            {"starts-with", "$Content-Type", ""}
        }
    })
    local string_to_sign = basexx.to_base64(oss_policy)
    local signature = basexx.to_base64(sha1.hmac_binary(ngx.var.oss_secret_key,
                                                        string_to_sign))
    return string_to_sign, signature
end

function user:add_follower(uid, follower_id)
    local client = redis_client:new()
    client:run("zadd", string.format("uid(%d):followers", uid),
               util.timestamp(), follower_id)
    self:update({followers_count = db.raw("followers_count + 1")}, "id = ?", uid)
end

function user:remove_follower(uid, follower_id)
    local client = redis_client:new()
    client:run("zrem", string.format("uid(%d):followers", uid), follower_id)
    self:update({followers_count = db.raw("followers_count - 1")}, "id = ?", uid)
end

function user:add_following(uid, following_id)
    local client = redis_client:new()
    client:run("zadd", string.format("uid(%d):followings", uid),
               util.timestamp(), following_id)
    self:update({followings_count = db.raw("followings_count + 1")}, "id = ?",
                uid)
end

function user:remove_following(uid, following_id)
    local client = redis_client:new()
    client:run("zrem", string.format("uid(%d):followings", uid), following_id)
    self:update({followings_count = db.raw("followings_count - 1")}, "id = ?",
                uid)
end

function user:add_advocated_comment(uid, comment_id)
    local client = redis_client:new()
    return client:run("zadd", string.format("uid(%d):advocated_comments", uid),
                      util.timestamp(), comment_id)
end

function user:remove_advocated_comment(uid, comment_id)
    local client = redis_client:new()
    return client:run("zrem", string.format("uid(%d):advocated_comments", uid),
                      comment_id)
end

function user:add_opposed_comment(uid, comment_id)
    local client = redis_client:new()
    return client:run("zadd", string.format("uid(%d):opposed_comments", uid),
                      util.timestamp(), comment_id)
end

function user:remove_opposed_comment(uid, comment_id)
    local client = redis_client:new()
    return client:run("zrem", string.format("uid(%d):opposed_comments", uid),
                      comment_id)
end

function user:get_following_ids(uid, offset)
    if not offset then offset = 0 end

    local client = redis_client:new()

    return client:run("zrevrangebyscore",
                      string.format("uid(%d):followings", uid), "+inf", 0,
                      "limit", offset, 20)
end

function user:get_follower_ids(uid, offset)
    if not offset then offset = 0 end

    local client = redis_client:new()

    return client:run("zrevrangebyscore",
                      string.format("uid(%d):followers", uid), "+inf", 0,
                      "limit", offset, 20)
end

return user
