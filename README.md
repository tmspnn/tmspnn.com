# tmspnn.com

Frontend & gateway of tmspnn.com

## Lua Dependencies

-   basexx
-   cjson
-   lapis
-   md5
-   pgmoon
-   resty.cookie
-   resty.jit-uuid
-   resty.redis
-   resty.validation
-   resty.websocket
-   sha1

## Redis Cache

| Key                            | Type       | Description                             |
| ------------------------------ | ---------- | --------------------------------------- |
| page(index):search_placeholder | String     | Placeholder of search input in homepage |
| page(index):recommended_tags   | Sorted Set | Recommended tags in homepage            |
| user_token(%s):uid             | String     |
| mobile(%s):vcode               | String     |

## Postgres Advisory Locks

| Number | Description       |
| ------ | ----------------- |
| 0      | Rating an article |
