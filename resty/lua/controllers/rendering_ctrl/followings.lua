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

local function get_followings(uid)
    local fl_ids = PG.query([[
        select refer_to from "interaction"
        where created_by = ? and type = 2 limit 50;
    ]], uid)

    if empty(fl_ids) then return {} end

    return PG.query([[
        select id, profile, nickname, description, fame from "user"
        where id in ?;
    ]], db.list(map(fl_ids, lambda("x", "x.refer_to"))))
end

local function followings(app)
    local ctx = app.ctx

    local user = assert(get_user(tonumber(app.params.user_id)),
                        "user.not.exists")

    local fl = get_followings(user.id)

    ctx.data = {uid = ctx.uid, followings = fl}
    ctx.page_title = user.nickname .. "的关注"
    ctx.tags_in_head = {tags:css("followings")}
    ctx.tags_in_body = {tags:json(ctx.data), tags:js("followings")}

    return {render = "pages.followings"}
end

return followings
