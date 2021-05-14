create database tmspnn;

-- User
create table "user" (
    id serial primary key,
    nickname varchar(256) not null default '',
    profile varchar(256) not null default '',
    fame numeric not null default 1.0,
    gender smallint not null default 0,
    "desc" varchar(256) not null default '',
    location varchar(128) not null default '',
    mobile varchar(64) unique not null,
    email varchar(64) unique not null,
    identity_no varchar(64) unique not null,
    articles_count integer not null default 0,
    followings_count integer not null default 0,
    followers_count integer not null default 0,
    obj jsonb not null default '{}'::jsonb,
    ts_vector tsvector not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index user_fame_idx on "user" (fame);
create index user_followers_count_idx on "user" (followers_count);
create index user_obj_gin on "user" using gin (obj);
create index user_search_idx on "user" using gin (ts_vector);

-- Article
create table "article" (
    id serial primary key,
    rating numeric not null default 0.0,
    weight numeric not null default 1.0,
    fame numeric not null default 0.0,
    title varchar(256) not null,
    created_by integer not null,
    author varchar(256) not null default '',
    cover varchar(256) not null default '',
    "desc" varchar(256) not null default '',
    content text not null,
    tags varchar(64)[] not null default '{}',
    obj jsonb not null default '{}'::jsonb,
    ts_vector tsvector not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index article_weight_idx on "article" (weight);
create index article_fame_idx on "article" (fame);
create index article_create_by_idx on "article" (created_by);
create index article_obj_gin on "article" using gin (obj);
create index article_search_idx on "article" using gin (ts_vector);