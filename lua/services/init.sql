create database tmspnn;

-- User
create table "user" (
    id serial primary key,
    mobile varchar(64) unique not null,
    password text not null,
    nickname varchar(256) unique not null,
    profile varchar(256) not null default '',
    -- 0: male, 1: female
    gender smallint not null default 0,
    -- 0: normal, 1: abuse_reported, -1: removed
    state smallint not null default 0,
    description varchar(256) not null default '',
    location varchar(128) not null default '',
    fame numeric not null default 1.0,
    email varchar(64) unique not null,
    identity_no varchar(64) unique not null,
    articles_count integer not null default 0,
    followings_count integer not null default 0,
    following_ids integer [] not null default '{}',
    followers_count integer not null default 0,
    follower_ids integer [] not null default '{}',
    ratings_count integer not null default 0,
    inbox text [] not null default '{}',
    feed_ids integer [] not null default '{}',
    obj jsonb not null default '{}' :: jsonb,
    ts_vector tsvector not null default to_tsvector(''),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create unique index user_nickname_uniq_idx on "user" (nickname);

create index user_fame_idx on "user" (fame);

create index user_followers_count_idx on "user" (followers_count);

create index user_obj_gin on "user" using gin (obj jsonb_path_ops);

create index user_search_idx on "user" using gin (ts_vector);

-- Article
create table "article" (
    id serial primary key,
    created_by integer not null,
    rating numeric not null default 3.0,
    weight numeric not null default 1.0,
    fame numeric not null default 0.0,
    cover varchar(256) not null default '',
    title varchar(256) not null,
    author varchar(256) not null,
    author_profile varchar(256) not null default '',
    summary varchar(256) not null,
    wordcount smallint not null,
    pageview integer not null default 0,
    content text not null,
    -- 0: normal, 1: private, 2: comment_unavailable, 3: abuse_reported, -1: removed
    state smallint not null default 0,
    obj jsonb not null default '{}' :: jsonb,
    ts_vector tsvector not null default to_tsvector(''),
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index article_weight_idx on "article" (weight);

create index article_fame_idx on "article" (fame);

create index article_create_by_idx on "article" (created_by);

create index article_obj_gin on "article" using gin (obj jsonb_path_ops);

create index article_search_idx on "article" using gin (ts_vector);

-- Rating
create table "rating" (
    id serial primary key,
    created_by integer not null,
    article_id integer not null,
    rating numeric not null default 0.0,
    weight numeric not null default 1.0,
    obj jsonb not null default '{}' :: jsonb,
    created_at timestamp with time zone not null default now()
);

create index rating_created_by_idx on "rating" (created_by);

create index rating_article_id_idx on "rating" (article_id);

-- Comment
create table "comment" (
    id serial primary key,
    created_by integer not null,
    author varchar(256) not null,
    author_profile varchar(256) not null,
    article_id integer not null,
    article_title varchar(256) not null,
    refer_to integer not null,
    reference_author varchar(256) not null,
    reference_author_profile varchar(256) not null,
    reference_content text not null,
    reference_created_at timestamp with time zone not null,
    content text not null,
    advocators_count integer not null default 0,
    obj jsonb not null default '{}' :: jsonb,
    -- 0:normal, 1: abuse_reported, -1: removed
    state smallint not null default 0,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index comment_created_by_idx on "comment" (created_by);

create index comment_article_id_idx on "comment" (article_id);

-- Interaction
create table "interaction" (
    id serial primary key,
    -- 1: comment_advocation, 2: followship, 3: abuse_report
    "type" smallint not null,
    created_by integer not null,
    refer_to integer not null,
    obj jsonb not null default '{}' :: jsonb,
    created_at timestamp with time zone not null default now()
);

create index interaction_created_by_idx on "interaction" (created_by);

create index interaction_refer_to_idx on "interaction" (refer_to);

-- Conversation
create table "conversation" (
    id serial primary key,
    created_by integer not null,
    members integer [] not null,
    title varchar(128) not null,
    muted_by integer [] not null default '{}',
    obj jsonb not null default '{}' :: jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index conversation_created_by_idx on "conversation" (created_by);

create index conversation_members_idx on "conversation" using gin (members jsonb_path_ops);

-- Message
create table "message" (
    id serial primary key,
    "uuid" uuid not null,
    created_by integer not null,
    nickname varchar(256) not null,
    profile varchar(256) not null,
    conversation_id integer not null,
    -- 0: text, 1: image, 2: video
    "type" smallint not null default 0,
    "text" text not null default '',
    -- Pathname of the resource, not the whole uri
    "file" varchar(256) not null default '',
    obj jsonb not null default '{}' :: jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

create index uuid_idx on "message" ("uuid");

create index message_created_by_idx on "message" (created_by);

create index message_conversation_id_idx on "message" (conversation_id);