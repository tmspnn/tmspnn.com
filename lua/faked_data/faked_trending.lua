local ten_articles = {}
local ten_authors = {}

for i = 1, 10 do
    table.insert(ten_articles, {
        id = 10001,
        cover = "https://cdn.pixabay.com/photo/2016/02/09/19/57/aurora-1190254__480.jpg",
        title = "This is a test title",
        updated_at = "5/01",
        created_by = 10007,
        profile = "https://cdn.pixabay.com/photo/2019/10/19/11/35/wolf-4561204__480.png",
        nickname = "Thomas Peng Li",
        desc = "This is a testing desc, this is a testing desc, blublublu",
        rating = 4.3,
        ratings_count = 25,
        pageview = 101,
        comments_count = 18,
        tags = {"Linux", "OpenResty", "木兰", "Security"}
    })
    table.insert(ten_authors, {
        id = 10007,
        nickname = "Thomas Peng Li",
        profile = "https://cdn.pixabay.com/photo/2019/10/19/11/35/wolf-4561204__480.png",
        fame = 100,
        gender = 0,
        location = "上海 浦东",
        mobile = "15601648701",
        email = "tmspnn@gmail.com",
        identity_no = "421023198806040096",
        articles_count = 1,
        followings_count = 0,
        followers_count = 0,
        obj = {}
    })
end

local faked_trending = {
    articles_24h = ten_articles,
    articles_overall = ten_articles,
    authors_24h = ten_authors,
    authors_overall = ten_authors
}

return faked_trending
