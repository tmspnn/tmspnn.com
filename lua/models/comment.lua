-- External modules
local date = require("date")
local db = require("lapis.db")

-- Local modules
local Model = require("models/model")
local util = require("util")

-- Module
local comment = Model:new("comment")

function comment:regularize(c)
    c.created_at = date(c.created_at):fmt("%Y/%m/%d %H:%M")
end

return comment
