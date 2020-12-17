-- External modules
local ngx = require "ngx" -- The Nginx interface provided by OpenResty
local db = require "lapis.db"

-- Local modules
local model = {}

-- As a base class, __index points to self
model.__index = model

function model:new(table_name)
    local m = {
        table_name = table_name
    }

    return setmetatable(m, self)
end

function model:find_by_id(id)
    local sql = string.format("* from \"%s\" where id = ?", self.table_name)
    return db.select(sql, id)
end

function model:find(sql, ...)
    local params = {...}
    return db.select(sql, unpack(params))
end

function model:create(init_data)
    return db.insert(self.table_name, init_data, db.raw("*"))
end

function model:update(props, conditions, ...)
    local params = {...}
    return db.update(self.table_name, props, conditions, unpack(params))
end

function model:delete(conditions, ...)
    -- conditions: string
    local params = {...}
    return db.delete(self.table_name, conditions, unpack(params))
end

function model:query(sql, ...)
    local params = {...}
    return db.query(sql, unpack(params))
end

return model
