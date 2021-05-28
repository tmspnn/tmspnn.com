-- External modules
-- > The Nginx interface provided by OpenResty
local ngx = require "ngx"
local db = require "lapis.db"

-- Implementation
local Model = {}

-- As a base class, __index points to self
Model.__index = Model

function Model:new(table_name)
    local m = {
        table_name = table_name
    }
    return setmetatable(m, self)
end

function Model:find_by_id(id)
    local res, err = db.select(string.format([[
        * from "%s" where id = ?
    ]], self.table_name), id)
    if not res then
        error(err)
    end
    return res[1]
end

function Model:find(sql, ...)
    local res, err = db.select(sql, unpack({...}))
    if not res then
        error(err)
    end
    return res
end

function Model:create(data)
    local res, err = db.insert(self.table_name, data, db.raw("*"))
    if not res then
        error(err)
    end
    -- { 1 = record, affected_rows = 1 }
    return res[1]
end

function Model:update(data, conditions, ...) -- conditions is a string
    local res, err = db.update(self.table_name, data, conditions, unpack({...}))
    if not res then
        error(err)
    end
    return res
end

function Model:delete(conditions, ...) -- conditions is a string
    local res, err = db.delete(self.table_name, conditions, unpack({...}))
    if not res then
        error(err)
    end
    return res
end

function Model:query(sql, ...)
    local res, err = db.query(sql, unpack({...}))
    if not res then
        error(err)
    end
    return res
end

return Model
