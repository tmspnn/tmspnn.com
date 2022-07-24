local db = require "lapis.db"
--
local PG = require "services.PG"
local empty = require "util.empty"
local map = require "util.map"
local lambda = require "util.lambda"
local tags = require "util.tags"

local function get_user(uid)
    return PG.query([[
        select id, nickname from "user" where id = ?
    ]], uid)[1]
end

local function get_followers(uid)
    local fl_ids = PG.query([[
        select created_by from "interaction"
        where refer_to = ? and type = 2 limit 50;
    ]], uid)

    if empty(fl_ids) then return {} end

    return PG.query([[
        select id, profile, nickname, description, fame from "user"
        where id in ?;
    ]], db.list(map(fl_ids, lambda("x", "x.created_by"))))
end

local function followers(app)
    local ctx = app.ctx

    local user = assert(get_user(tonumber(app.params.user_id)),
                        "user.not.exists")

    local fl = get_followers(user.id)

    ctx.data = {uid = ctx.uid, followers = fl}
    ctx.page_title = "他们关注了 " .. user.nickname
    ctx.tags_in_head = {tags:css("followers")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("followers")}

    return {render = "pages.followers"}
end

return followers
