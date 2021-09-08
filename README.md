# tmspnn.com

Frontend & gateway of tmspnn.com

## Installed rocks:

ansicolors
1.0.2-3 (installed) - /usr/local/lib/luarocks/rocks

basexx
0.4.1-1 (installed) - /usr/local/lib/luarocks/rocks

bcrypt
2.1-6 (installed) - /usr/local/lib/luarocks/rocks

date
2.1.3-1 (installed) - /usr/local/lib/luarocks/rocks

etlua
1.3.0-1 (installed) - /usr/local/lib/luarocks/rocks

htmlparser
0.3.6-1 (installed) - /usr/local/lib/luarocks/rocks

lapis
1.9.0-1 (installed) - /usr/local/lib/luarocks/rocks

lbc
20180729-1 (installed) - /usr/local/lib/luarocks/rocks

loadkit
1.1.0-1 (installed) - /usr/local/lib/luarocks/rocks

lpeg
1.0.2-1 (installed) - /usr/local/lib/luarocks/rocks

lua-cjson
2.1.0.6-1 (installed) - /usr/local/lib/luarocks/rocks

lua-resty-cookie
0.1.0-1 (installed) - /usr/local/lib/luarocks/rocks

lua-resty-jit-uuid
0.0.7-2 (installed) - /usr/local/lib/luarocks/rocks

lua-resty-validation
2.7-1 (installed) - /usr/local/lib/luarocks/rocks

luabitop
1.0.2-3 (installed) - /usr/local/lib/luarocks/rocks

luafilesystem
1.8.0-1 (installed) - /usr/local/lib/luarocks/rocks

luaossl
20200709-0 (installed) - /usr/local/lib/luarocks/rocks

luasec
1.0.1-1 (installed) - /usr/local/lib/luarocks/rocks

luasocket
3.0rc1-2 (installed) - /usr/local/lib/luarocks/rocks

md5
1.3-1 (installed) - /usr/local/lib/luarocks/rocks

mimetypes
1.0.0-2 (installed) - /usr/local/lib/luarocks/rocks

moses
2.1.0-1 (installed) - /usr/local/lib/luarocks/rocks

pgmoon
1.12.0-1 (installed) - /usr/local/lib/luarocks/rocks

sha1
0.6.0-1 (installed) - /usr/local/lib/luarocks/rocks

utf8
1.2-0 (installed) - /usr/local/lib/luarocks/rocks

web_sanitize
1.1.0-1 (installed) - /usr/local/lib/luarocks/rocks

## Redis Cache

| Key                          | Type   | Description                             |
| ---------------------------- | ------ | --------------------------------------- |
| page(index):carousel_items   | List   | Carousel in homepage                    |
| page(index):recommended_tags | List   | Recommended tags in homepage            |
| page(search):placeholder     | String | Placeholder of text field in searchpage |
| user_token(%s):uid           | String |
| mobile(%s):vcode             | String |

## Postgres Advisory Locks

| Number | Description       |
| ------ | ----------------- |
| 0      | Rating an article |
