-- External modules
-- https://leafo.net/lapis/reference/database.html
local db = require "lapis.db"

-- Local modules and aliases
local fmt = string.format

-- Implementation
local PG = {MAX_INT = 2147483647}

-- @param { string } table_name
-- @param { table } data
-- @returns { 1: table, affected_rows: int }
function PG.create(table_name, data)
    return assert(db.insert(table_name, data, db.raw("*")))
end

-- @param { string } table_name
-- @param { table } data
-- @param { string | table } conditions
function PG.update(table_name, data, conditions, ...)
    return assert(db.update(table_name, data, conditions, ...))
end

-- @param { string } table_name
-- @param { string | table } conditions
function PG.delete(table_name, conditions, ...)
    return assert(db.delete(table_name, conditions, ...))
end

-- @param {string} sql
function PG.query(sql, ...) return assert(db.query(sql, ...)) end

return PG
