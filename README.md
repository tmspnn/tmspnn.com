# tmspnn.com

Frontend & gateway of tmspnn.com

## Lua Dependencies

-   basexx
-   cjson
-   htmlparser
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
