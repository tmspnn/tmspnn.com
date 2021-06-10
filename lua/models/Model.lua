-- External modules
-- https://leafo.net/lapis/reference/database.html
local db = require "lapis.db"

-- Aliases
local fmt = string.format

-- Implementation
local Model = {}

-- As a base class, __index points to self
Model.__index = Model

-- @param {string} table_name
function Model:new(table_name)
    local m = {table_name = table_name}
    return setmetatable(m, self)
end

-- @param {int} id
function Model:find_by_id(id)
    return assert(db.select(fmt([[
        * from "%s" where id = ?
    ]], self.table_name), id))[1]
end

-- @param {string} sql
-- @param {any} ...
function Model:find(sql, ...)
    return assert(db.select(fmt([[
        * from "%s" where
    ]], self.table_name) .. sql, ...))
end

-- @param {table} data
-- @returns {1 = table, affected_rows = int}
function Model:create(data)
    return assert(db.insert(self.table_name, data, db.raw("*")))
end

-- @param {table} data
-- @param {table|string} conditions
function Model:update(data, conditions, ...)
    return assert(db.update(self.table_name, data, conditions, ...))
end

-- @param {table|string} conditions
function Model:delete(conditions, ...)
    return assert(db.delete(self.table_name, conditions, ...))
end

-- @param {string} sql
function Model:query(sql, ...) return assert(db.query(sql, ...)) end

return Model
