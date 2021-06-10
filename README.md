# tmspnn.com

Frontend & gateway of tmspnn.com

## Lua Dependencies

-   basexx
-   cjson
-   lapis
-   pgmoon
-   resty.cookie
-   resty.jit-uuid
-   resty.redis
-   resty.validation
-   resty.websocket

## Redis Cache

| Key                | Type       |
| ------------------ | ---------- |
| recommended_tags   | Sorted Set |
| search_placeholder | String     |
| user_token(%s):uid | String     |
| mobile(%s):vcode   | String     |

## Postgres Advisory Locks

| Number | Desc              |
| ------ | ----------------- |
| 0      | Rating an article |
