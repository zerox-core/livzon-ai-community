--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4
-- Dumped by pg_dump version 16.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public.works DROP CONSTRAINT IF EXISTS works_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.work_comments DROP CONSTRAINT IF EXISTS work_comments_work_id_fkey;
ALTER TABLE IF EXISTS ONLY public.work_comments DROP CONSTRAINT IF EXISTS work_comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.work_comments DROP CONSTRAINT IF EXISTS work_comments_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.work_comment_likes DROP CONSTRAINT IF EXISTS work_comment_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.work_comment_likes DROP CONSTRAINT IF EXISTS work_comment_likes_comment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.votes DROP CONSTRAINT IF EXISTS votes_work_id_fkey;
ALTER TABLE IF EXISTS ONLY public.votes DROP CONSTRAINT IF EXISTS votes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.showcase_sites DROP CONSTRAINT IF EXISTS showcase_sites_work_id_fkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_work_id_fkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_sender_id_fkey;
ALTER TABLE IF EXISTS ONLY public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_receiver_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_parent_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comment_likes DROP CONSTRAINT IF EXISTS comment_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.comment_likes DROP CONSTRAINT IF EXISTS comment_likes_comment_id_fkey;
ALTER TABLE IF EXISTS ONLY public.assets DROP CONSTRAINT IF EXISTS assets_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.artifacts DROP CONSTRAINT IF EXISTS artifacts_work_id_fkey;
ALTER TABLE IF EXISTS ONLY public.artifacts DROP CONSTRAINT IF EXISTS artifacts_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_signups DROP CONSTRAINT IF EXISTS activity_signups_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_signups DROP CONSTRAINT IF EXISTS activity_signups_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_signups DROP CONSTRAINT IF EXISTS activity_signups_activity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_signup_forms DROP CONSTRAINT IF EXISTS activity_signup_forms_activity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_reservations DROP CONSTRAINT IF EXISTS activity_reservations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_reservations DROP CONSTRAINT IF EXISTS activity_reservations_activity_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_reminders DROP CONSTRAINT IF EXISTS activity_reminders_reservation_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_letters DROP CONSTRAINT IF EXISTS activity_letters_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_letters DROP CONSTRAINT IF EXISTS activity_letters_asset_id_fkey;
ALTER TABLE IF EXISTS ONLY public.activity_letters DROP CONSTRAINT IF EXISTS activity_letters_activity_id_fkey;
DROP INDEX IF EXISTS public.uq_works_wall_order;
DROP INDEX IF EXISTS public.uq_votes_pool_day;
DROP INDEX IF EXISTS public.idx_works_wall_order;
DROP INDEX IF EXISTS public.idx_works_user;
DROP INDEX IF EXISTS public.idx_works_status;
DROP INDEX IF EXISTS public.idx_works_kind;
DROP INDEX IF EXISTS public.idx_works_category;
DROP INDEX IF EXISTS public.idx_works_activity;
DROP INDEX IF EXISTS public.idx_wc_work;
DROP INDEX IF EXISTS public.idx_wc_parent;
DROP INDEX IF EXISTS public.idx_wc_alive;
DROP INDEX IF EXISTS public.idx_votes_work;
DROP INDEX IF EXISTS public.idx_votes_user;
DROP INDEX IF EXISTS public.idx_tpl_updated;
DROP INDEX IF EXISTS public.idx_signups_status;
DROP INDEX IF EXISTS public.idx_signup_activity;
DROP INDEX IF EXISTS public.idx_showcase_work;
DROP INDEX IF EXISTS public.idx_sessions_expire;
DROP INDEX IF EXISTS public.idx_res_activity;
DROP INDEX IF EXISTS public.idx_reg_user;
DROP INDEX IF EXISTS public.idx_reg_status;
DROP INDEX IF EXISTS public.idx_reg_activity;
DROP INDEX IF EXISTS public.idx_posts_section;
DROP INDEX IF EXISTS public.idx_posts_pinned;
DROP INDEX IF EXISTS public.idx_posts_created;
DROP INDEX IF EXISTS public.idx_posts_alive;
DROP INDEX IF EXISTS public.idx_notif_user;
DROP INDEX IF EXISTS public.idx_notif_unread;
DROP INDEX IF EXISTS public.idx_letter_user;
DROP INDEX IF EXISTS public.idx_letter_activity;
DROP INDEX IF EXISTS public.idx_dm_receiver;
DROP INDEX IF EXISTS public.idx_dm_pair;
DROP INDEX IF EXISTS public.idx_comments_post;
DROP INDEX IF EXISTS public.idx_comments_parent;
DROP INDEX IF EXISTS public.idx_assets_user_checksum;
DROP INDEX IF EXISTS public.idx_assets_user;
DROP INDEX IF EXISTS public.idx_assets_ref;
DROP INDEX IF EXISTS public.idx_assets_cat_backend;
DROP INDEX IF EXISTS public.idx_artifacts_work;
DROP INDEX IF EXISTS public.idx_artifacts_asset;
DROP INDEX IF EXISTS public.idx_activity_letters_asset;
DROP INDEX IF EXISTS public.idx_act_kind;
ALTER TABLE IF EXISTS ONLY public.works DROP CONSTRAINT IF EXISTS works_pkey;
ALTER TABLE IF EXISTS ONLY public.work_comments DROP CONSTRAINT IF EXISTS work_comments_pkey;
ALTER TABLE IF EXISTS ONLY public.work_comment_likes DROP CONSTRAINT IF EXISTS work_comment_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.votes DROP CONSTRAINT IF EXISTS votes_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS uq_users_open_id;
ALTER TABLE IF EXISTS ONLY public.activity_signups DROP CONSTRAINT IF EXISTS uq_signup_user_activity;
ALTER TABLE IF EXISTS ONLY public.activity_reservations DROP CONSTRAINT IF EXISTS uq_res_user_activity;
ALTER TABLE IF EXISTS ONLY public.activity_reminders DROP CONSTRAINT IF EXISTS uq_reminder_res_kind;
ALTER TABLE IF EXISTS ONLY public.signup_form_templates DROP CONSTRAINT IF EXISTS signup_form_templates_pkey;
ALTER TABLE IF EXISTS ONLY public.showcase_sites DROP CONSTRAINT IF EXISTS showcase_sites_pkey;
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_pkey;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
ALTER TABLE IF EXISTS ONLY public.direct_messages DROP CONSTRAINT IF EXISTS direct_messages_pkey;
ALTER TABLE IF EXISTS ONLY public.community_config DROP CONSTRAINT IF EXISTS community_config_pkey;
ALTER TABLE IF EXISTS ONLY public.comments DROP CONSTRAINT IF EXISTS comments_pkey;
ALTER TABLE IF EXISTS ONLY public.comment_likes DROP CONSTRAINT IF EXISTS comment_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.assets DROP CONSTRAINT IF EXISTS assets_pkey;
ALTER TABLE IF EXISTS ONLY public.artifacts DROP CONSTRAINT IF EXISTS artifacts_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_signups DROP CONSTRAINT IF EXISTS activity_signups_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_signup_forms DROP CONSTRAINT IF EXISTS activity_signup_forms_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_reservations DROP CONSTRAINT IF EXISTS activity_reservations_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_reminders DROP CONSTRAINT IF EXISTS activity_reminders_pkey;
ALTER TABLE IF EXISTS ONLY public.activity_letters DROP CONSTRAINT IF EXISTS activity_letters_pkey;
ALTER TABLE IF EXISTS ONLY public.activities DROP CONSTRAINT IF EXISTS activities_pkey;
ALTER TABLE IF EXISTS public.works ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.votes ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.users ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.registrations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.notifications ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.artifacts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_signups ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_reservations ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_reminders ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.activity_letters ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.works_id_seq;
DROP TABLE IF EXISTS public.works;
DROP TABLE IF EXISTS public.work_comments;
DROP TABLE IF EXISTS public.work_comment_likes;
DROP SEQUENCE IF EXISTS public.votes_id_seq;
DROP TABLE IF EXISTS public.votes;
DROP SEQUENCE IF EXISTS public.users_id_seq;
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public.signup_form_templates;
DROP TABLE IF EXISTS public.showcase_sites;
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.registrations_id_seq;
DROP TABLE IF EXISTS public.registrations;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.post_likes;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.direct_messages;
DROP TABLE IF EXISTS public.community_config;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public.comment_likes;
DROP TABLE IF EXISTS public.assets;
DROP SEQUENCE IF EXISTS public.artifacts_id_seq;
DROP TABLE IF EXISTS public.artifacts;
DROP SEQUENCE IF EXISTS public.activity_signups_id_seq;
DROP TABLE IF EXISTS public.activity_signups;
DROP TABLE IF EXISTS public.activity_signup_forms;
DROP SEQUENCE IF EXISTS public.activity_reservations_id_seq;
DROP TABLE IF EXISTS public.activity_reservations;
DROP SEQUENCE IF EXISTS public.activity_reminders_id_seq;
DROP TABLE IF EXISTS public.activity_reminders;
DROP SEQUENCE IF EXISTS public.activity_letters_id_seq;
DROP TABLE IF EXISTS public.activity_letters;
DROP TABLE IF EXISTS public.activities;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: activities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activities (
    id text NOT NULL,
    kind text DEFAULT 'upcoming'::text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    date_label text DEFAULT ''::text NOT NULL,
    location text DEFAULT ''::text NOT NULL,
    tag text DEFAULT ''::text NOT NULL,
    sort integer DEFAULT 0 NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    start_at timestamp with time zone,
    flow_type text DEFAULT 'instant'::text NOT NULL
);


--
-- Name: activity_letters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_letters (
    id integer NOT NULL,
    activity_id text NOT NULL,
    user_id integer NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    dept text DEFAULT ''::text NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    file_name text DEFAULT ''::text NOT NULL,
    file_size integer DEFAULT 0 NOT NULL,
    storage_url text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    asset_id text
);


--
-- Name: activity_letters_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_letters_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_letters_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_letters_id_seq OWNED BY public.activity_letters.id;


--
-- Name: activity_reminders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_reminders (
    id bigint NOT NULL,
    reservation_id integer NOT NULL,
    kind text DEFAULT 'pre_start'::text NOT NULL,
    channel text DEFAULT 'feishu'::text NOT NULL,
    feishu_msg_id text DEFAULT ''::text NOT NULL,
    sent_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_reminders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_reminders_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_reminders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_reminders_id_seq OWNED BY public.activity_reminders.id;


--
-- Name: activity_reservations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_reservations (
    id integer NOT NULL,
    activity_id text NOT NULL,
    user_id integer NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    dept text DEFAULT ''::text NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_reservations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_reservations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_reservations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_reservations_id_seq OWNED BY public.activity_reservations.id;


--
-- Name: activity_signup_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_signup_forms (
    activity_id text NOT NULL,
    profile jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity_signups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.activity_signups (
    id integer NOT NULL,
    activity_id text NOT NULL,
    user_id integer NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    dept text DEFAULT ''::text NOT NULL,
    contact text DEFAULT ''::text NOT NULL,
    note text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    upload jsonb DEFAULT '{}'::jsonb NOT NULL,
    response jsonb DEFAULT '{}'::jsonb NOT NULL,
    asset_id text,
    status text DEFAULT 'approved'::text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    admin_cards jsonb DEFAULT '[]'::jsonb NOT NULL
);


--
-- Name: COLUMN activity_signups.asset_id; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.activity_signups.asset_id IS '报名时选择的资产 ID（assets.id），作品被删除则置空';


--
-- Name: activity_signups_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.activity_signups_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: activity_signups_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.activity_signups_id_seq OWNED BY public.activity_signups.id;


--
-- Name: artifacts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.artifacts (
    id integer NOT NULL,
    work_id integer NOT NULL,
    kind text NOT NULL,
    filename text DEFAULT ''::text NOT NULL,
    version text DEFAULT 'v1'::text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    storage_url text DEFAULT ''::text NOT NULL,
    checksum text DEFAULT ''::text NOT NULL,
    downloads integer DEFAULT 0 NOT NULL,
    guide text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    asset_id text
);


--
-- Name: artifacts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.artifacts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: artifacts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.artifacts_id_seq OWNED BY public.artifacts.id;


--
-- Name: assets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.assets (
    id text NOT NULL,
    user_id integer,
    category text DEFAULT ''::text NOT NULL,
    backend text DEFAULT 'local'::text NOT NULL,
    kind text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    storage_url text DEFAULT ''::text NOT NULL,
    checksum text DEFAULT ''::text NOT NULL,
    repo_url text DEFAULT ''::text NOT NULL,
    remote_url text DEFAULT ''::text NOT NULL,
    remote_status text DEFAULT ''::text NOT NULL,
    agent_report text DEFAULT ''::text NOT NULL,
    stage text DEFAULT ''::text NOT NULL,
    guide text DEFAULT ''::text NOT NULL,
    downloads integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    source text DEFAULT ''::text NOT NULL
);


--
-- Name: COLUMN assets.source; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.assets.source IS '资产来源标记：signup:<activityId> 表示报名活动时上传的作品';


--
-- Name: comment_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_likes (
    comment_id text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comments (
    id text NOT NULL,
    post_id text NOT NULL,
    parent_id text,
    user_id integer,
    author text DEFAULT ''::text NOT NULL,
    dept text DEFAULT ''::text NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: community_config; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.community_config (
    id integer DEFAULT 1 NOT NULL,
    data jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT community_config_id_check CHECK ((id = 1))
);


--
-- Name: direct_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.direct_messages (
    id text NOT NULL,
    sender_id integer NOT NULL,
    receiver_id integer NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT uq_dm_no_self CHECK ((sender_id <> receiver_id))
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type text DEFAULT 'system'::text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    body text DEFAULT ''::text NOT NULL,
    link text DEFAULT ''::text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    activity_id text DEFAULT ''::text NOT NULL,
    stage text DEFAULT ''::text NOT NULL
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: post_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.post_likes (
    post_id text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.posts (
    id text NOT NULL,
    user_id integer,
    author text DEFAULT ''::text NOT NULL,
    dept text DEFAULT ''::text NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    section text DEFAULT 'chat'::text NOT NULL,
    work_id integer,
    work jsonb,
    images jsonb DEFAULT '[]'::jsonb NOT NULL,
    attachments jsonb DEFAULT '[]'::jsonb NOT NULL,
    pinned boolean DEFAULT false NOT NULL,
    tag text,
    likes integer DEFAULT 0 NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: registrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.registrations (
    id integer NOT NULL,
    name text NOT NULL,
    department text DEFAULT ''::text NOT NULL,
    contact text DEFAULT ''::text NOT NULL,
    activity text NOT NULL,
    will_share boolean DEFAULT false NOT NULL,
    share_topic text DEFAULT ''::text NOT NULL,
    remark text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id integer
);


--
-- Name: registrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.registrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: registrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.registrations_id_seq OWNED BY public.registrations.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    sid text NOT NULL,
    sess jsonb NOT NULL,
    expire bigint NOT NULL
);


--
-- Name: showcase_sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.showcase_sites (
    slug text NOT NULL,
    title text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    work_id integer,
    path text DEFAULT ''::text NOT NULL,
    url text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: signup_form_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.signup_form_templates (
    id text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    profile jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    open_id text DEFAULT ''::text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    email text DEFAULT ''::text NOT NULL,
    department text DEFAULT ''::text NOT NULL,
    role text DEFAULT 'member'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    union_id text DEFAULT ''::text NOT NULL,
    avatar text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    access_token text DEFAULT ''::text NOT NULL,
    token_expire timestamp with time zone,
    last_login_at timestamp with time zone
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.votes (
    id integer NOT NULL,
    voter_id text DEFAULT ''::text NOT NULL,
    activity_id text DEFAULT ''::text NOT NULL,
    work_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id integer,
    vote_date date DEFAULT CURRENT_DATE NOT NULL
);


--
-- Name: votes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.votes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: votes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.votes_id_seq OWNED BY public.votes.id;


--
-- Name: work_comment_likes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_comment_likes (
    comment_id text NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: work_comments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.work_comments (
    id text NOT NULL,
    work_id integer NOT NULL,
    parent_id text,
    user_id integer,
    author text DEFAULT ''::text NOT NULL,
    dept text DEFAULT ''::text NOT NULL,
    text text DEFAULT ''::text NOT NULL,
    likes integer DEFAULT 0 NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: works; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.works (
    id integer NOT NULL,
    kind text DEFAULT 'image'::text NOT NULL,
    title text NOT NULL,
    author text DEFAULT ''::text NOT NULL,
    category text DEFAULT ''::text NOT NULL,
    description text DEFAULT ''::text NOT NULL,
    cover text DEFAULT ''::text NOT NULL,
    source text DEFAULT ''::text NOT NULL,
    session text DEFAULT ''::text NOT NULL,
    detail jsonb DEFAULT '{}'::jsonb NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    created_by text DEFAULT ''::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id integer,
    wall_order integer,
    activity_id text DEFAULT ''::text NOT NULL
);


--
-- Name: works_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.works_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: works_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.works_id_seq OWNED BY public.works.id;


--
-- Name: activity_letters id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_letters ALTER COLUMN id SET DEFAULT nextval('public.activity_letters_id_seq'::regclass);


--
-- Name: activity_reminders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reminders ALTER COLUMN id SET DEFAULT nextval('public.activity_reminders_id_seq'::regclass);


--
-- Name: activity_reservations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reservations ALTER COLUMN id SET DEFAULT nextval('public.activity_reservations_id_seq'::regclass);


--
-- Name: activity_signups id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_signups ALTER COLUMN id SET DEFAULT nextval('public.activity_signups_id_seq'::regclass);


--
-- Name: artifacts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifacts ALTER COLUMN id SET DEFAULT nextval('public.artifacts_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: registrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations ALTER COLUMN id SET DEFAULT nextval('public.registrations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: votes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes ALTER COLUMN id SET DEFAULT nextval('public.votes_id_seq'::regclass);


--
-- Name: works id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.works ALTER COLUMN id SET DEFAULT nextval('public.works_id_seq'::regclass);


--
-- Data for Name: activities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activities (id, kind, title, date_label, location, tag, sort, data, updated_at, start_at, flow_type) FROM stdin;
web-marathon-2026q3	current	「一页一世界」网页设计马拉松 · 9 月赛季	2026-09-26 09:00 — 09-27 21:00（48 小时）	线上直播间 + 珠海办公室开放工位	网页设计	0	{"id": "web-marathon-2026q3", "tag": "网页设计", "desc": "48 小时从命题到上线：抽一个命题盲盒，用一页 HTML 讲一个完整的故事。不限工具、不限框架，交出的作品直接挂上社团大屏轮播，评审与社区投票双通道评奖。", "name": "「一页一世界」网页设计马拉松 · 9 月赛季", "signup": true, "location": "线上直播间 + 珠海办公室开放工位", "dateLabel": "2026-09-26 09:00 — 09-27 21:00（48 小时）", "highlights": ["命题盲盒抽取 + 48 小时极限创作，完整走一遍「创意 → 上线」", "作品零门槛上墙：大屏轮播 + 源码在线浏览，点击即看", "评审打分 60% + 社区投票 40%，双通道评出赛季前三", "优秀源码收录社团源码展示库，成为下一届的参考范本"]}	2026-09-14 23:35:55.487024+08	2026-09-26 09:00:00+08	competition
skill-workshop-2026q4	upcoming	Skill 插件工坊 · 第 1 期「把重复交给 agent」	2026-10-17（周六）14:00 — 17:30	总部培训教室 B + 线上同步	效率工坊	0	{"id": "skill-workshop-2026q4", "tag": "效率工坊", "desc": "每周都在重复同一件事？把它写成第一个 Skill 插件。2 小时入门 + 1.5 小时实操，从社区里现成的开源 Skill 学起，现场互测互评，人人带着一个能跑的插件离开。", "name": "Skill 插件工坊 · 第 1 期「把重复交给 agent」", "signup": true, "location": "总部培训教室 B + 线上同步", "dateLabel": "2026-10-17（周六）14:00 — 17:30", "highlights": ["2 小时入门：Skill 是什么、怎么让 agent 记住你的工作流", "1.5 小时实操：从真实痛点出发写一个自己的 Skill", "现场互测互评，优秀插件推荐上社团大屏轮播", "沉淀社团 Skill 精选库：Superpowers 等开源项目逐个拆解"]}	2026-09-14 23:35:55.494021+08	2026-10-17 14:00:00+08	instant
aigc-season-2026a	upcoming	美术资源设计赛 · 秋季场「为社团而设计」	2026-10-24 14:00 开题 — 11-07 18:00 截稿	线上（开题 + 点评双直播）	美术资源	1	{"id": "aigc-season-2026a", "tag": "美术资源", "desc": "命题两周创作期：为社团设计真正用得上的美术资源——吉祥物、App 图标按钮组件、系列插画，三个赛道任选。画、插画、任何美术资源都能投稿，AI 辅助不限工具，双导师线上点评，获奖作品直接投入社团产品与年历使用。", "name": "美术资源设计赛 · 秋季场「为社团而设计」", "signup": true, "location": "线上（开题 + 点评双直播）", "dateLabel": "2026-10-24 14:00 开题 — 11-07 18:00 截稿", "highlights": ["两周期命题创作：10-24 开题直播抽命题，11-07 截稿", "吉祥物 / UI 美术资产 / 插画三赛道，工具不限（即梦、SD、MJ 均可）", "双导师线上点评：一次创作方向校准 + 一次成稿精修", "获奖作品上大屏轮播、投入社团 App 开发并收入 2027 年历"]}	2026-09-14 23:35:55.494698+08	2026-10-24 14:00:00+08	instant
\.


--
-- Data for Name: activity_letters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_letters (id, activity_id, user_id, name, dept, note, file_name, file_size, storage_url, created_at, asset_id) FROM stdin;
\.


--
-- Data for Name: activity_reminders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_reminders (id, reservation_id, kind, channel, feishu_msg_id, sent_at) FROM stdin;
\.


--
-- Data for Name: activity_reservations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_reservations (id, activity_id, user_id, name, dept, note, created_at) FROM stdin;
\.


--
-- Data for Name: activity_signup_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_signup_forms (activity_id, profile, updated_at) FROM stdin;
web-marathon-2026q3	{"team": {"label": "组队情况", "enabled": true, "options": ["单人", "2-3 人小队"]}, "rules": "<p><b>「一页一世界」网页设计马拉松 · 9 月赛季</b></p><ul><li>9-26 上午 9 点直播间抽命题盲盒，48 小时内提交一页可在线浏览的作品；</li><li>技术栈不限，鼓励纯手写 HTML / CSS / JS，可用 AI 辅助但需在作品中注明；</li><li>作品须为赛前新创作，获奖前三名将收录进社团源码展示库；</li><li>报名截止 9-25 18:00，通过审核后可在活动期间上传参赛作品。</li></ul>", "fields": [{"key": "page_direction", "type": "select", "label": "创作方向", "options": ["单页叙事（滚动长页）", "多页小站（3-5 页）", "交互动效实验", "其他（自由发挥）"], "required": true, "placeholder": ""}, {"key": "toolchain", "type": "text", "label": "常用工具 / 技术栈", "options": [], "required": true, "placeholder": "如：VS Code + 原生 HTML/CSS"}, {"key": "experience", "type": "radio", "label": "网页开发经验", "options": ["零基础（第一次写页面）", "做过静态页面", "能独立开发完整站点"], "required": true, "placeholder": ""}, {"key": "idea", "type": "textarea", "label": "命题方向初想（选填）", "options": [], "required": false, "placeholder": "想做什么主题？一句话即可，抽到盲盒后可推翻重来"}], "contact": true, "deadline": "2026-09-25（周五）18:00", "needUpload": false}	2026-09-14 23:35:55.495171+08
skill-workshop-2026q4	{"team": {"label": "组队情况", "enabled": false, "options": ["单人", "2-3 人"]}, "rules": "<p><b>Skill 插件工坊 · 第 1 期</b></p><ul><li>线下 + 线上同步，请自带电脑，提前装好你常用的 AI 编程工具；</li><li>入门环节会拆解 Superpowers 等开源 Skill 项目，欢迎先去 GitHub 围观；</li><li>实操环节从你自己最想自动化的重复工作出发，现场写一个能跑的 Skill；</li><li>名额 30 人（线下 15 + 线上 15），先到先得。</li></ul>", "fields": [{"key": "painpoint", "type": "textarea", "label": "最想自动化的重复工作", "options": [], "required": true, "placeholder": "例：每周从十几个 Excel 汇总周报"}, {"key": "skill_level", "type": "radio", "label": "Skill 使用经验", "options": ["新手（还没用过 agent 编程）", "用过 Claude Code / Cursor 等工具", "写过自定义 Skill / 插件"], "required": true, "placeholder": ""}, {"key": "expect", "type": "text", "label": "期望工坊产出（选填）", "options": [], "required": false, "placeholder": "希望带着什么离开这次工坊？"}], "contact": true, "deadline": "2026-10-16（周五）18:00", "needUpload": false}	2026-09-14 23:35:55.501602+08
aigc-season-2026a	{"team": {"label": "组队情况", "enabled": false, "options": ["单人", "2-3 人"]}, "rules": "<p><b>美术资源设计赛 · 秋季场「为社团而设计」</b></p><ul><li>10-24 开题直播公布完整命题，两周创作期，11-07 18:00 截稿；</li><li>吉祥物 / UI 美术资产 / 插画三赛道，每人限投一件（一组），AI 生成占比不限但需提交关键提示词；</li><li>获奖作品将进入社团大屏轮播、投入社团 App 开发，并收入 2027 社团年历；</li><li>报名即视为同意作品在社团内外展示与产品内使用。</li></ul>", "fields": [{"key": "track", "type": "radio", "label": "参赛赛道", "options": ["吉祥物设计", "UI 美术资产（图标 / 按钮 / 组件）", "插画 · 概念设计"], "required": true, "placeholder": ""}, {"key": "tools", "type": "text", "label": "常用 AI 工具", "options": [], "required": true, "placeholder": "如：即梦 / Stable Diffusion / Midjourney"}, {"key": "portfolio", "type": "textarea", "label": "过往作品（选填）", "options": [], "required": false, "placeholder": "链接或简单描述，没有也可留空"}], "contact": true, "deadline": "2026-10-23（周五）18:00", "needUpload": false}	2026-09-14 23:35:55.502208+08
\.


--
-- Data for Name: activity_signups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_signups (id, activity_id, user_id, name, dept, contact, note, created_at, upload, response, asset_id, status, updated_at, admin_cards) FROM stdin;
\.


--
-- Data for Name: artifacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artifacts (id, work_id, kind, filename, version, size, storage_url, checksum, downloads, guide, created_at, asset_id) FROM stdin;
13	145	image	「珠小团」表情与动作延展稿-作品集.zip	v1	342679	/uploads/assets/program/ast_mu2628fo9b0c8264.zip	81b10141599ccb159d6b585452a80d8deee1503c1a76e00fb26f7248aefd6474	0	美术作品集合集（4 张原图）	2026-09-15 12:23:14.487641+08	ast_mu2628fp716cb905
14	146	image	社团 App 功能图标集 · 四风格设计稿-作品集.zip	v1	756339	/uploads/assets/program/ast_mu2628g3fa6481e3.zip	8c245f3f1a6baf401c611c2df790831b80e52135d5892173ae07237324a3722d	0	美术作品集合集（4 张原图）	2026-09-15 12:23:14.502524+08	ast_mu2628g4418c24e9
15	147	image	社团 App 按钮与组件设计稿-作品集.zip	v1	621000	/uploads/assets/program/ast_mu2628gi0aa539f5.zip	7a60807eb9d451464d86363f525ada63b6d5a170bf15fc3a51280849c4c428d4	0	美术作品集合集（4 张原图）	2026-09-15 12:23:14.516724+08	ast_mu2628gj3df3d130
12	144	image	「珠小团」社团吉祥物 · 标准形象设计稿-作品集.zip	v1	326431	/uploads/assets/program/ast_mu2628eu68ac04df.zip	1f2344f723cdd07a60d3c1532d9208bda5ff003e17c463f2fd7ef1ce291c589f	1	美术作品集合集（4 张原图）	2026-09-15 12:23:14.470243+08	ast_mu2628evbc33c2a3
17	149	image	系列插画「城市与人」-作品集.zip	v1	877457	/uploads/assets/program/ast_mu2628ha1197104c.zip	96b602f4f881936889bfbe44cc9f55239f184faf3895e5d0212685edc8a04da5	1	美术作品集合集（4 张原图）	2026-09-15 12:23:14.545693+08	ast_mu2628hcc5e7fb1a
16	148	image	系列插画「自然与科技」-作品集.zip	v1	1077139	/uploads/assets/program/ast_mu2628gw9b873732.zip	5df7168a05bb5bc85b2665c071c1a5a8a39da28c6b746fa03088d8751d1a96f1	1	美术作品集合集（4 张原图）	2026-09-15 12:23:14.531692+08	ast_mu2628gyf3d444f1
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assets (id, user_id, category, backend, kind, name, size, storage_url, checksum, repo_url, remote_url, remote_status, agent_report, stage, guide, downloads, created_at, updated_at, source) FROM stdin;
ast_mu2628evbc33c2a3	\N	program	local	image	「珠小团」社团吉祥物 · 标准形象设计稿-作品集.zip	326431	/uploads/assets/program/ast_mu2628eu68ac04df.zip	1f2344f723cdd07a60d3c1532d9208bda5ff003e17c463f2fd7ef1ce291c589f						美术作品集合集（4 张原图）	0	2026-09-15 12:23:14.45677+08	2026-09-15 12:23:14.45677+08	backfill
ast_mu2628fp716cb905	\N	program	local	image	「珠小团」表情与动作延展稿-作品集.zip	342679	/uploads/assets/program/ast_mu2628fo9b0c8264.zip	81b10141599ccb159d6b585452a80d8deee1503c1a76e00fb26f7248aefd6474						美术作品集合集（4 张原图）	0	2026-09-15 12:23:14.486676+08	2026-09-15 12:23:14.486676+08	backfill
ast_mu2628g4418c24e9	\N	program	local	image	社团 App 功能图标集 · 四风格设计稿-作品集.zip	756339	/uploads/assets/program/ast_mu2628g3fa6481e3.zip	8c245f3f1a6baf401c611c2df790831b80e52135d5892173ae07237324a3722d						美术作品集合集（4 张原图）	0	2026-09-15 12:23:14.501497+08	2026-09-15 12:23:14.501497+08	backfill
ast_mu2628gj3df3d130	\N	program	local	image	社团 App 按钮与组件设计稿-作品集.zip	621000	/uploads/assets/program/ast_mu2628gi0aa539f5.zip	7a60807eb9d451464d86363f525ada63b6d5a170bf15fc3a51280849c4c428d4						美术作品集合集（4 张原图）	0	2026-09-15 12:23:14.515966+08	2026-09-15 12:23:14.515966+08	backfill
ast_mu2628gyf3d444f1	\N	program	local	image	系列插画「自然与科技」-作品集.zip	1077139	/uploads/assets/program/ast_mu2628gw9b873732.zip	5df7168a05bb5bc85b2665c071c1a5a8a39da28c6b746fa03088d8751d1a96f1						美术作品集合集（4 张原图）	0	2026-09-15 12:23:14.530791+08	2026-09-15 12:23:14.530791+08	backfill
ast_mu2628hcc5e7fb1a	\N	program	local	image	系列插画「城市与人」-作品集.zip	877457	/uploads/assets/program/ast_mu2628ha1197104c.zip	96b602f4f881936889bfbe44cc9f55239f184faf3895e5d0212685edc8a04da5						美术作品集合集（4 张原图）	0	2026-09-15 12:23:14.544963+08	2026-09-15 12:23:14.544963+08	backfill
\.


--
-- Data for Name: comment_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comment_likes (comment_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.comments (id, post_id, parent_id, user_id, author, dept, text, likes, deleted, created_at) FROM stdin;
\.


--
-- Data for Name: community_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_config (id, data, updated_at) FROM stdin;
1	{"banners": [{"link": "/announce/launch.html", "image": "/showcase/banners/launch.jpeg", "title": "丽珠AI创新平台 · 正式落地", "caption": "作品墙 / 社区 / 活动 全面开放"}, {"link": "/announce/marathon.html", "image": "/showcase/banners/marathon.jpeg", "title": "一页一世界 · 网页设计马拉松", "caption": "9-26 开赛 · 48 小时从命题到上线"}, {"link": "/announce/workshop.html", "image": "/showcase/banners/workshop.jpeg", "title": "Skill 插件工坊 · 第 1 期", "caption": "10-17 · 把重复交给 agent"}, {"link": "/announce/art.html", "image": "/showcase/banners/art.jpeg", "title": "美术资源设计赛 · 秋季场", "caption": "10-24 开题 · 为社团而设计"}], "sections": [{"key": "all", "desc": "全部动态", "label": "首页"}, {"key": "featured", "desc": "官方精选", "label": "精华"}, {"key": "resource", "desc": "模板 / 工具 / 物料", "label": "资源分享"}, {"key": "tutorial", "desc": "上手与避坑", "label": "教程攻略"}, {"key": "qa", "desc": "有问必答", "label": "问答求助"}, {"key": "chat", "desc": "碎碎念与日常", "label": "闲聊灌水"}], "announcement": {"text": "🎉 庆祝丽珠AI创新平台正式落地！作品墙、社团社区、活动中心全面开放，官方教程已上线精华区，三个新赛季活动陆续开启——点击轮播海报查看详情。", "time": "2026-09-15", "author": "丽珠AI社团 · 官方"}}	2026-09-15 13:47:33.881861+08
\.


--
-- Data for Name: direct_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.direct_messages (id, sender_id, receiver_id, text, read, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, body, link, read, created_at, activity_id, stage) FROM stdin;
\.


--
-- Data for Name: post_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.post_likes (post_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.posts (id, user_id, author, dept, text, section, work_id, work, images, attachments, pinned, tag, likes, deleted, created_at) FROM stdin;
p_mu26jvpo906d1f3e	1	丽珠AI社团 · 官方	官方账号	【官方教程】如何打包上传你的 AIGC 作品集（新功能）\n\n社团平台已支持「作品集压缩包」，美术类作品提交时必须打包上传，其他同学可以在详情页一键下载整套原图。操作流程：\n\n① 整理原图：把这套作品的全部原图放进一个文件夹，建议按 01、02、03 命名，顺序就是展示顺序。\n② 打包：全选 → 右键 → 压缩为 zip（不要用 rar，zip 兼容性最好）。\n③ 上传：作品提交页选择「AI 图像」类型，填好标题和介绍，在「作品集压缩包」一栏选你的 zip。\n④ 图集地址：上传页的「图集」一栏每行填一张图的地址，它们会变成详情页顶部的横板轮播图和下方的图文详情。\n\n几个提醒：\n- 轮播图是固定 16:9 横板比例，竖图会被裁切，建议主图用横构图；\n- 介绍文字可以分段，空一行就是一个新段落，会按插画文章的样式排在原图上方；\n- 已发布的作品不能补传附件，提交前一定检查 zip 里的图全不全。	tutorial	\N	\N	[{"url": "/showcase/tutorials/t2.jpeg", "name": "教程配图"}]	[]	t	featured	0	f	2026-09-13 20:36:57.805816+08
p_mu26jvpp213b2520	1	丽珠AI社团 · 官方	官方账号	【官方教程】ComfyUI 入门：节点到底怎么连\n\n刚打开 ComfyUI 看到一堆节点连来连去会头晕，其实核心就一条流水线：\n\n加载模型 → 写提示词 → 采样生成 → 解码出图\n\n最小工作流只需要 6 个节点：\n① Load Checkpoint：选底模（SD1.5 快，SDXL 好看，新手先用 SD1.5 练手）。\n② CLIP Text Encode（正向）：写你想要的。\n③ CLIP Text Encode（负向）：写你不想要的，比如「模糊、变形、多余手指」。\n④ Empty Latent Image：定尺寸，512×512 起步，别一上来就 1024。\n⑤ KSampler：核心参数三个——steps 20~30、cfg 7~8、采样器 Euler a 或 DPM++ 2M。\n⑥ VAE Decode + Save Image：出图保存。\n\n新手三个坑：\n- 图片全灰：VAE 没连上，检查 Decode 节点的 vae 输入；\n- 人脸崩坏：512 尺寸画全身容易崩，先画半身特写；\n- 长得跟提示词没关系：cfg 太低，提到 7 左右再试。\n\n跑通最小流之后，再玩 LoRA（挂风格）、ControlNet（控姿势）、高清修复（Upscale），一步步加节点就行。	tutorial	\N	\N	[{"url": "/showcase/tutorials/t3.jpeg", "name": "教程配图"}]	[]	t	featured	0	f	2026-09-14 02:36:57.80693+08
p_mu26jvpq7db4c4eb	1	丽珠AI社团 · 官方	官方账号	【官方教程】给 agent 写第一个 Skill：从零到能用\n\nSkill 就是「教 agent 干一件具体事的说明书」。不需要会写代码，会写文档就能做。\n\n一个 Skill 最少两个文件：\n① SKILL.md：说明书本体，开头三行最关键——名字、一句话描述、什么时候用。agent 就是靠这段话判断「现在要不要翻你这本说明书」。\n② 资源文件（可选）：脚本、模板、示例，被说明书引用。\n\n写说明书的三个要点：\n- 触发词写全：用户会怎么说这件事？把各种说法都列上，agent 才知道什么时候该出手；\n- 步骤写成清单：第一步做什么、第二步做什么，别写散文；\n- 给例子：一个输入输出的完整例子，比十句描述都管用。\n\n检验标准很简单：换一个完全不了解这件事的 agent，只看你这份说明书，能不能一次把事做对？能，就是合格的 Skill。\n\n进阶：把重复踩过的坑写成「已知问题」一节，agent 会绕开走。我们作品墙上的 Superpowers、Anthropic Skills 都是优秀范例，先去下载看看人家的结构。	tutorial	\N	\N	[{"url": "/showcase/tutorials/t4.jpeg", "name": "教程配图"}]	[]	t	featured	0	f	2026-09-14 08:36:57.807994+08
p_mu26jvps972e28b7	1	丽珠AI社团 · 官方	官方账号	【官方教程】十分钟看懂 MCP：AI 的「USB 接口」\n\nMCP（Model Context Protocol）一句话：让 AI 用统一的方式连上外部工具和数据，就像 USB 让电脑连上各种外设。\n\n没有 MCP 之前：每接一个工具（查日历、读文件、连数据库）都要给 AI 单独写一套对接代码，N 个 AI × M 个工具 = 灾难。\n有了 MCP：工具方按标准把自己包装成「MCP Server」，AI 端按标准做「MCP Client」，即插即用。\n\n三个核心概念：\n① Tools（工具）：AI 可以调用的动作，比如「搜索文件」「发一条消息」；\n② Resources（资源）：AI 可以读的数据，比如一份文档、一张表；\n③ Prompts（提示模板）：预置的常用指令。\n\n对普通用户意味着什么？你在支持的客户端里装好一个 MCP Server（比如飞书、GitHub、本地文件系统），AI 就多了对应的手和眼，不用你再复制粘贴。\n\n想动手试试？作品墙上的「MCP Servers 参考服务器」合集是官方参考实现，挑一个 fileserver 跑起来，十分钟就能看到效果。	tutorial	\N	\N	[{"url": "/showcase/tutorials/t5.jpeg", "name": "教程配图"}]	[]	t	featured	0	f	2026-09-14 14:36:57.809071+08
p_mu26jvps15bd3792	1	丽珠AI社团 · 官方	官方账号	【官方教程】网页设计马拉松参赛指南：48 小时怎么打\n\n「一页一世界」网页马拉松快到了，给第一次参赛的同学一份实战节奏表：\n\n【赛前】\n- 把工具链跑通：编辑器、本地预览、部署方式，开赛前一天全部试一遍；\n- 收藏 3~5 个灵感站（Awwwards、站酷），不是抄，是校准审美。\n\n【0~4 小时】命题盲盒拆开先别急着写代码。花 1 小时写一句话故事线：这一页要讲什么？访客看完记住什么？想不清楚就换题思路，别硬憋。\n\n【4~24 小时】出第一版：先把整页结构搭完（开头、主体、结尾），丑没关系。马拉松最大的坑是前 12 小时死磕一个按钮的圆角，最后页都没做完。\n\n【24~44 小时】填血肉：配图、文案、动效。动效只加三处：首屏入场、滚动衔接、结尾点睛，多了乱。\n\n【最后 4 小时】只做三件事：手机上打开看一遍、加载速度测一遍、错别字读一遍。\n\n评分是评审 60% + 社区投票 40%，故事讲得完整的作品，投票从来不差。提交后源码会进社团源码展示库，记得写两句 README。	tutorial	\N	\N	[{"url": "/showcase/tutorials/t6.jpeg", "name": "教程配图"}]	[]	t	featured	0	f	2026-09-14 20:36:57.80987+08
p_mu26jvpi3e49a32a	1	丽珠AI社团 · 官方	官方账号	【官方教程】AI 绘画提示词速成：从一句话到一张好图\n\n很多同学第一次用 AI 画画，输入「画一只猫」就觉得效果不好。其实提示词是有结构的，记住这个公式：\n\n主体 + 细节 + 风格 + 构图 + 画质词\n\n① 主体：说清楚画什么，越具体越好。「一只橘猫」不如「一只趴在窗台上的橘猫，逆光，毛发边缘发亮」。\n② 细节：加环境、光线、表情、材质。光线词特别好用：柔光、逆光、黄金时刻、霓虹灯。\n③ 风格：赛博朋克、水彩、像素风、扁平插画……风格词一个就够，多了会打架。\n④ 构图：特写、俯视、对称构图、留白。想要海报感就写「居中构图 + 大面积留白」。\n⑤ 画质词：8K、超精细、杰作——放最后，锦上添花。\n\n反面例子：「画一个好看的女孩」（太模糊）\n正面例子：「穿汉服的少女站在樱花树下，微风吹起衣袖，水彩风格，柔和逆光，半身特写，超精细」\n\n练手建议：先抄优秀作品集的提示词改着玩，改一个词看变化，三天就有手感了。	tutorial	\N	\N	[{"url": "/showcase/tutorials/t1.jpeg", "name": "教程配图"}]	[]	t	featured	0	f	2026-09-13 14:36:57.80007+08
p-mu29yp9e-f8489b	1	测试用户	研发中心	【权限验证·临时帖】admin 编辑后的正文	chat	\N	\N	[]	[]	t	featured	0	t	2026-09-15 14:12:28.131238+08
p-mu29ypbb-6e8da2	4	测试用户·普通	测试部	【权限验证·临时帖】member 编辑自己的帖子成功	chat	\N	\N	[]	[]	f	\N	0	t	2026-09-15 14:12:28.2+08
\.


--
-- Data for Name: registrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.registrations (id, name, department, contact, activity, will_share, share_topic, remark, status, created_at, updated_at, user_id) FROM stdin;
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.sessions (sid, sess, expire) FROM stdin;
PwBjN-GbyQ-tnpTPvc1gGAfZmb7G440Y	{"cookie": {"path": "/", "expires": "2026-09-17T02:07:00.461Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "authState": "24ddbe748dd71ff1f7802c145c597ae6"}	1789610820461
B0YRU3lwX2eW6IpmZpXCnNfka3Jhotcd	{"cookie": {"path": "/", "expires": "2026-09-17T03:00:02.357Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "authState": "53694f0abe8f4aa56f6cbf65717236b7"}	1789614002357
BHK5dzjmWG9mR_NQsa1sSLupbk90VjVp	{"cookie": {"path": "/", "expires": "2026-09-17T03:08:18.808Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "authState": "4e005f9d78a2079538d916daa9784ee6"}	1789614498808
V3efozKJpxr30svhBluw04vzhDprOGra	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T04:16:07.757Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789618567757
c9gu6JEGYq-vdL-uHa4anzFDgrH6yV2l	{"name": "测试用户", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-22T04:24:18.545Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1790051058657
vQNZ4r5XrjJ3kkbyezanw-FfneLEyqfM	{"name": "测试用户", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-21T07:31:27.329Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789975887329
pJCOT19Nmr416H01_RJDfJTIv7drMFqk	{"name": "测试用户·普通", "role": "member", "cookie": {"path": "/", "expires": "2026-09-21T07:36:41.705Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 4}	1789976201807
308O0D-5ACnFWP9rxIhAAv-FO5_yq6av	{"name": "测试用户·普通", "role": "member", "cookie": {"path": "/", "expires": "2026-09-21T09:33:54.797Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 4}	1789983234958
tApF6Y6ZUnQ5AWis9FlFjXi6wzGe3RQP	{"name": "测试用户·普通", "role": "member", "cookie": {"path": "/", "expires": "2026-09-22T06:12:28.182Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 4}	1790057548230
OXt4c-OSLxLDNOPi4L-i0OLTr64NwGbb	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-21T08:47:25.139Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1790041589743
HSlK3GL1fAOS02-h7H1F33PxOyKAhrCE	{"name": "测试用户", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-22T06:12:27.869Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1790057548244
dgkP_amJE5GHny2DraL4YkPePBBKtaVS	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-18T02:35:00.345Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1790129657143
9bM5yGw5pzqjcl9UrYlM1QGG9vlG8WpN	{"name": "测试用户", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-21T07:34:51.153Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789976091249
sYTNMKszB3TQgxDWIda-9TweFU1_Htni	{"cookie": {"path": "/", "expires": "2026-09-18T08:13:56.830Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "authState": "deaef3b1c1976501b61770fab17e24ca"}	1789719389590
f_bUpuv1goxLBirexg8Ax0ikYdWXUZBj	{"name": "测试用户·普通", "role": "member", "cookie": {"path": "/", "expires": "2026-09-21T07:34:51.251Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 4}	1789976091269
lQUjUTV8PtxtyykU9sEUe8ZyLVqfeLN6	{"name": "测试用户·普通", "role": "member", "cookie": {"path": "/", "expires": "2026-09-21T09:34:23.120Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 4}	1789983263136
1HTcc8LmDieLjo-Q0q3B7CwkzzUBG10b	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T04:17:48.381Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789618906987
lG6OBPd2PnTsBogJX_w0GqimqhZTzNrh	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T04:49:30.635Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789620570635
UCZEjucUUhrFblHOBtFNDkvfCSuhbN2v	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-15T09:46:34.871Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789614614053
68XkGxi_DGjkrZ94i-o649-EmM6JFIqk	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T04:16:35.256Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789618595256
3xgvfEdnwr27C2h4wvrFh41tJYuQerck	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T14:02:27.795Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789742273622
lCKnAJw0JRfUplnG9Nk7wF6T8HANSxtU	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T04:50:05.527Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789620612070
V-OoRWJbL8cI44wCKUlnR2-KwrzlL6lc	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T04:50:57.532Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789620657532
hxiIvy6pHyloJVnGY7o8zJcFIrydJ4GY	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T04:51:21.708Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789620686250
B1grL-dRo8qReN-1LhAA0J_WNQMbzZp5	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T04:54:11.953Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789620853759
N5GG-mkEs_zC2cXHoPBrsDMHVIt5NHQm	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T07:49:41.267Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789631381267
Ip8YKMvGPv_Jm6SvnY9Y3kR6500Pkouk	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T07:59:50.499Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789631990499
iszyUZDknto6REPq19VtC9RlTDWHfgEK	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T09:06:24.048Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789635984166
g8i1Vp_i-40ZwrNjbiC_CVawYqMNZM1O	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T09:07:16.812Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 3}	1789636037000
UkYZfP3d4jMb_YKNDFWYaNY5PH6l9faF	{"cookie": {"path": "/", "expires": "2026-09-17T14:24:54.578Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "authState": "a2c927ba11a8b7c65e6b576592604ed3"}	1789655094578
\.


--
-- Data for Name: showcase_sites; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.showcase_sites (slug, title, description, work_id, path, url, created_at) FROM stdin;
midnight-bookstore	深夜书店 · 24 点不打烊	夜色里的旧书店：一个纯 CSS 沉浸式单页，灯光与书页都用手写渐变模拟	122	public/showcase/midnight-bookstore/index.html	/showcase/midnight-bookstore/	2026-09-14 23:35:55.541113+08
monsoon-post	季风邮局	信件乘着季风抵达：南洋港口邮局主题单页，信封与季风气流串起整个故事	123	public/showcase/monsoon-post/index.html	/showcase/monsoon-post/	2026-09-14 23:35:55.54191+08
hanabi-night	夏夜花火大会	Canvas 粒子烟花 + 日式排版，滚动即进入祭典夜空	124	public/showcase/hanabi-night/index.html	/showcase/hanabi-night/	2026-09-14 23:35:55.542296+08
dunhuang-murals	丝路花雨	敦煌壁画主题的沉浸式长页，飞天与藻井纹样在滚动中徐徐展开	125	public/showcase/dunhuang-murals/index.html	/showcase/dunhuang-murals/	2026-09-14 23:35:55.542658+08
horologium	钟表齿轮博物馆	三百年机械计时史：从哥特塔钟到精密腕表，暗金质感的策展式单页	126	public/showcase/horologium/index.html	/showcase/horologium/	2026-09-14 23:35:55.543032+08
oilpaper-umbrella	一把油纸伞	江南烟雨题材的国风交互长页，伞面开合之间切换章节	127	public/showcase/oilpaper-umbrella/index.html	/showcase/oilpaper-umbrella/	2026-09-14 23:35:55.543394+08
cirque-brume	雾夜马戏团	红幕布拉开的哥特马戏之夜，节目单式导航与剧场氛围拉满	128	public/showcase/cirque-brume/index.html	/showcase/cirque-brume/	2026-09-14 23:35:55.543758+08
abyssal-codex	深海生物志	一页潜到海底：深海生物图鉴，越深越暗的滚动式下潜体验	129	public/showcase/abyssal-codex/index.html	/showcase/abyssal-codex/	2026-09-14 23:35:55.544148+08
bioluminescent-bay	荧光海湾	冷光深海主题，鼠标划过之处泛起蓝眼泪	130	public/showcase/bioluminescent-bay/index.html	/showcase/bioluminescent-bay/	2026-09-14 23:35:55.544502+08
paper-cut-realm	纸上剪影	中国剪纸艺术展：一把剪刀一张红纸，民俗纹样的现代排版演绎	131	public/showcase/paper-cut-realm/index.html	/showcase/paper-cut-realm/	2026-09-14 23:35:55.544849+08
paper-kite-museum	纸鸢博物馆	一只只风筝是一页页展品，策展式排版的小型线上博物馆	132	public/showcase/paper-kite-museum/index.html	/showcase/paper-kite-museum/	2026-09-14 23:35:55.545179+08
chama-trail	茶马古道	从云南到西藏的千年商路地图长卷，马帮铃铛声里的山河叙事	133	public/showcase/chama-trail/index.html	/showcase/chama-trail/	2026-09-14 23:35:55.545538+08
movable-type-studio	活字工坊	活字印刷互动工坊：字架、捡字、排版、拓印，一页走完千年印刷流程	134	public/showcase/movable-type-studio/index.html	/showcase/movable-type-studio/	2026-09-14 23:35:55.545945+08
amber-insect-archive	琥珀昆虫档案馆	穿越亿万年时光的琥珀标本馆，每只昆虫都是一座时间胶囊	135	public/showcase/amber-insect-archive/index.html	/showcase/amber-insect-archive/	2026-09-14 23:35:55.546338+08
\.


--
-- Data for Name: signup_form_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.signup_form_templates (id, name, profile, created_at, updated_at) FROM stdin;
tpl_mock_web_marathon	网页设计马拉松 · 标准报名	{"team": {"label": "组队情况", "enabled": true, "options": ["单人", "2-3 人小队"]}, "rules": "<p><b>「一页一世界」网页设计马拉松 · 9 月赛季</b></p><ul><li>9-26 上午 9 点直播间抽命题盲盒，48 小时内提交一页可在线浏览的作品；</li><li>技术栈不限，鼓励纯手写 HTML / CSS / JS，可用 AI 辅助但需在作品中注明；</li><li>作品须为赛前新创作，获奖前三名将收录进社团源码展示库；</li><li>报名截止 9-25 18:00，通过审核后可在活动期间上传参赛作品。</li></ul>", "fields": [{"key": "page_direction", "type": "select", "label": "创作方向", "options": ["单页叙事（滚动长页）", "多页小站（3-5 页）", "交互动效实验", "其他（自由发挥）"], "required": true, "placeholder": ""}, {"key": "toolchain", "type": "text", "label": "常用工具 / 技术栈", "options": [], "required": true, "placeholder": "如：VS Code + 原生 HTML/CSS"}, {"key": "experience", "type": "radio", "label": "网页开发经验", "options": ["零基础（第一次写页面）", "做过静态页面", "能独立开发完整站点"], "required": true, "placeholder": ""}, {"key": "idea", "type": "textarea", "label": "命题方向初想（选填）", "options": [], "required": false, "placeholder": "想做什么主题？一句话即可，抽到盲盒后可推翻重来"}], "contact": true, "deadline": "2026-09-25（周五）18:00", "needUpload": false}	2026-09-14 23:35:55.502807+08	2026-09-14 23:35:55.502807+08
tpl_mock_skill_wkshop	工坊 / 培训 · 轻报名	{"team": {"label": "组队情况", "enabled": false, "options": ["单人", "2-3 人"]}, "rules": "<p><b>Skill 插件工坊 · 第 1 期</b></p><ul><li>线下 + 线上同步，请自带电脑，提前装好你常用的 AI 编程工具；</li><li>入门环节会拆解 Superpowers 等开源 Skill 项目，欢迎先去 GitHub 围观；</li><li>实操环节从你自己最想自动化的重复工作出发，现场写一个能跑的 Skill；</li><li>名额 30 人（线下 15 + 线上 15），先到先得。</li></ul>", "fields": [{"key": "painpoint", "type": "textarea", "label": "最想自动化的重复工作", "options": [], "required": true, "placeholder": "例：每周从十几个 Excel 汇总周报"}, {"key": "skill_level", "type": "radio", "label": "Skill 使用经验", "options": ["新手（还没用过 agent 编程）", "用过 Claude Code / Cursor 等工具", "写过自定义 Skill / 插件"], "required": true, "placeholder": ""}, {"key": "expect", "type": "text", "label": "期望工坊产出（选填）", "options": [], "required": false, "placeholder": "希望带着什么离开这次工坊？"}], "contact": true, "deadline": "2026-10-16（周五）18:00", "needUpload": false}	2026-09-14 23:35:55.503326+08	2026-09-14 23:35:55.503326+08
tpl_mock_aigc_season	美术资源设计赛 · 三赛道报名	{"team": {"label": "组队情况", "enabled": false, "options": ["单人", "2-3 人"]}, "rules": "<p><b>美术资源设计赛 · 秋季场「为社团而设计」</b></p><ul><li>10-24 开题直播公布完整命题，两周创作期，11-07 18:00 截稿；</li><li>吉祥物 / UI 美术资产 / 插画三赛道，每人限投一件（一组），AI 生成占比不限但需提交关键提示词；</li><li>获奖作品将进入社团大屏轮播、投入社团 App 开发，并收入 2027 社团年历；</li><li>报名即视为同意作品在社团内外展示与产品内使用。</li></ul>", "fields": [{"key": "track", "type": "radio", "label": "参赛赛道", "options": ["吉祥物设计", "UI 美术资产（图标 / 按钮 / 组件）", "插画 · 概念设计"], "required": true, "placeholder": ""}, {"key": "tools", "type": "text", "label": "常用 AI 工具", "options": [], "required": true, "placeholder": "如：即梦 / Stable Diffusion / Midjourney"}, {"key": "portfolio", "type": "textarea", "label": "过往作品（选填）", "options": [], "required": false, "placeholder": "链接或简单描述，没有也可留空"}], "contact": true, "deadline": "2026-10-23（周五）18:00", "needUpload": false}	2026-09-14 23:35:55.503683+08	2026-09-14 23:35:55.503683+08
tpl_mock_light	通用 · 极简报名（仅联系方式）	{"team": {"label": "组队情况", "enabled": false, "options": ["单人", "2-3 人"]}, "rules": "<p>名额有限，报满即止。</p>", "fields": [{"key": "how_know", "type": "text", "label": "从哪里看到本次活动", "options": [], "required": false, "placeholder": "选填"}], "contact": true, "deadline": "", "needUpload": false}	2026-09-14 23:35:55.504014+08	2026-09-14 23:35:55.504014+08
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, open_id, name, email, department, role, created_at, union_id, avatar, status, access_token, token_expire, last_login_at) FROM stdin;
1	test-dev-openid	测试用户	test@livzon.com	研发中心	admin	2026-08-31 16:14:36.145245+08			active		\N	2026-08-31 16:14:36.145245+08
4	test-member-openid	测试用户·普通		测试部	member	2026-09-14 15:34:04.553766+08			active		\N	2026-09-14 15:34:04.553766+08
3	ou_0f592124153e2b55d7f097f8d6d46e4d	朱曦策			admin	2026-09-04 14:57:51.444867+08	on_bc046f92f8303df6c8e883381d1d9df9	https://s3-imfile.feishucdn.com/static-resource/v1/v3_0014h_bab60a02-c32d-4b02-a933-17fb9098b98g~?image_size=72x72&cut_type=&quality=&format=image&sticker_format=.webp	active		\N	2026-09-14 16:47:31.475+08
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.votes (id, voter_id, activity_id, work_id, created_at, user_id, vote_date) FROM stdin;
12	dbg-voter-1	web-marathon-2026q3	122	2026-09-15 10:31:48.953746+08	\N	2026-09-15
13	3	skill-workshop-2026q4	143	2026-09-15 10:54:33.806599+08	3	2026-09-15
\.


--
-- Data for Name: work_comment_likes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_comment_likes (comment_id, user_id, created_at) FROM stdin;
\.


--
-- Data for Name: work_comments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.work_comments (id, work_id, parent_id, user_id, author, dept, text, likes, deleted, created_at) FROM stdin;
\.


--
-- Data for Name: works; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.works (id, kind, title, author, category, description, cover, source, session, detail, status, published, created_by, created_at, updated_at, user_id, wall_order, activity_id) FROM stdin;
122	source	深夜书店 · 24 点不打烊	林晚舟	网页设计	夜色里的旧书店：一个纯 CSS 沉浸式单页，灯光与书页都用手写渐变模拟。纯手写 HTML/CSS，零依赖单文件，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/midnight-bookstore/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/midnight-bookstore/", "team": [{"name": "林晚舟", "role": "独立创作"}], "theme": "夜色里的旧书店：一个纯 CSS 沉浸式单页，灯光与书页都用手写渐变模拟", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "纯手写 HTML/CSS，零依赖单文件，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	林晚舟	2026-09-14 23:35:55.504514+08	2026-09-14 23:35:55.504514+08	\N	1	web-marathon-2026q3
123	source	季风邮局	闻笛	网页设计	信件乘着季风抵达：南洋港口邮局主题单页，信封与季风气流串起整个故事。纯手写 HTML/CSS，轻叙事排版，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/monsoon-post/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/monsoon-post/", "team": [{"name": "闻笛", "role": "独立创作"}], "theme": "信件乘着季风抵达：南洋港口邮局主题单页，信封与季风气流串起整个故事", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "纯手写 HTML/CSS，轻叙事排版，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	闻笛	2026-09-14 23:35:55.512658+08	2026-09-14 23:35:55.512658+08	\N	3	web-marathon-2026q3
124	source	夏夜花火大会	陈默	网页设计	Canvas 粒子烟花 + 日式排版，滚动即进入祭典夜空。Canvas 粒子系统 + 滚动叙事，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/hanabi-night/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/hanabi-night/", "team": [{"name": "陈默", "role": "独立创作"}], "theme": "Canvas 粒子烟花 + 日式排版，滚动即进入祭典夜空", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "Canvas 粒子系统 + 滚动叙事，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	陈默	2026-09-14 23:35:55.513282+08	2026-09-14 23:35:55.513282+08	\N	5	web-marathon-2026q3
125	source	丝路花雨	安西洲	网页设计	敦煌壁画主题的沉浸式长页，飞天与藻井纹样在滚动中徐徐展开。国风配色 + 滚动叙事，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/dunhuang-murals/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/dunhuang-murals/", "team": [{"name": "安西洲", "role": "独立创作"}], "theme": "敦煌壁画主题的沉浸式长页，飞天与藻井纹样在滚动中徐徐展开", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "国风配色 + 滚动叙事，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	安西洲	2026-09-14 23:35:55.513746+08	2026-09-14 23:35:55.513746+08	\N	7	web-marathon-2026q3
126	source	钟表齿轮博物馆	陆时衍	网页设计	三百年机械计时史：从哥特塔钟到精密腕表，暗金质感的策展式单页。排版驱动 + 微动效，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/horologium/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/horologium/", "team": [{"name": "陆时衍", "role": "独立创作"}], "theme": "三百年机械计时史：从哥特塔钟到精密腕表，暗金质感的策展式单页", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "排版驱动 + 微动效，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	陆时衍	2026-09-14 23:35:55.514207+08	2026-09-14 23:35:55.514207+08	\N	9	web-marathon-2026q3
127	source	一把油纸伞	江野	网页设计	江南烟雨题材的国风交互长页，伞面开合之间切换章节。滚动驱动动画 + 国风配色，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/oilpaper-umbrella/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/oilpaper-umbrella/", "team": [{"name": "江野", "role": "独立创作"}], "theme": "江南烟雨题材的国风交互长页，伞面开合之间切换章节", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "滚动驱动动画 + 国风配色，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	江野	2026-09-14 23:35:55.514675+08	2026-09-14 23:35:55.514675+08	\N	11	web-marathon-2026q3
136	skill	Superpowers —— 给 agent 装上一整套工作流方法论	社团 Skill 精选	Skill 插件	最火的 agent 技能框架：头脑风暴、SDLC、测试纪律……装上之后 agent 像换了个脑子，工坊入门环节就拆它。（GitHub 286,439 stars） 官方简介：An agentic skills framework & software development methodology that works.	/showcase/skills/superpowers.svg	GitHub 开源推荐		{"link": "https://github.com/obra/superpowers", "team": [{"name": "开源社区", "role": "作者"}], "theme": "给 agent 装上一整套工作流方法论", "layout": "linkcard", "source": "GitHub 开源推荐", "process": [{"note": "第 1 期工坊拆解项目", "stage": "推荐"}]}	approved	t	社团 Skill 精选	2026-09-14 23:35:55.533505+08	2026-09-14 23:35:55.533505+08	\N	2	skill-workshop-2026q4
128	source	雾夜马戏团	聂小满	网页设计	红幕布拉开的哥特马戏之夜，节目单式导航与剧场氛围拉满。字体排版 + 氛围动效，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/cirque-brume/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/cirque-brume/", "team": [{"name": "聂小满", "role": "独立创作"}], "theme": "红幕布拉开的哥特马戏之夜，节目单式导航与剧场氛围拉满", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "字体排版 + 氛围动效，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	聂小满	2026-09-14 23:35:55.515294+08	2026-09-14 23:35:55.515294+08	\N	13	web-marathon-2026q3
129	source	深海生物志	蓝以宁	网页设计	一页潜到海底：深海生物图鉴，越深越暗的滚动式下潜体验。滚动深度叙事，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/abyssal-codex/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/abyssal-codex/", "team": [{"name": "蓝以宁", "role": "独立创作"}], "theme": "一页潜到海底：深海生物图鉴，越深越暗的滚动式下潜体验", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "滚动深度叙事，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	蓝以宁	2026-09-14 23:35:55.516372+08	2026-09-14 23:35:55.516372+08	\N	15	web-marathon-2026q3
130	source	荧光海湾	何知遥	网页设计	冷光深海主题，鼠标划过之处泛起蓝眼泪。鼠标跟随 + 发光粒子，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/bioluminescent-bay/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/bioluminescent-bay/", "team": [{"name": "何知遥", "role": "独立创作"}], "theme": "冷光深海主题，鼠标划过之处泛起蓝眼泪", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "鼠标跟随 + 发光粒子，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	何知遥	2026-09-14 23:35:55.516806+08	2026-09-14 23:35:55.516806+08	\N	17	web-marathon-2026q3
131	source	纸上剪影	祝红绡	网页设计	中国剪纸艺术展：一把剪刀一张红纸，民俗纹样的现代排版演绎。民间美术 + 现代栅格，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/paper-cut-realm/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/paper-cut-realm/", "team": [{"name": "祝红绡", "role": "独立创作"}], "theme": "中国剪纸艺术展：一把剪刀一张红纸，民俗纹样的现代排版演绎", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "民间美术 + 现代栅格，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	祝红绡	2026-09-14 23:35:55.517256+08	2026-09-14 23:35:55.517256+08	\N	19	web-marathon-2026q3
132	source	纸鸢博物馆	顾星辞	网页设计	一只只风筝是一页页展品，策展式排版的小型线上博物馆。单文件静态站，语义化排版，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/paper-kite-museum/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/paper-kite-museum/", "team": [{"name": "顾星辞", "role": "独立创作"}], "theme": "一只只风筝是一页页展品，策展式排版的小型线上博物馆", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "单文件静态站，语义化排版，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	顾星辞	2026-09-14 23:35:55.51765+08	2026-09-14 23:35:55.51765+08	\N	21	web-marathon-2026q3
133	source	茶马古道	马千里	网页设计	从云南到西藏的千年商路地图长卷，马帮铃铛声里的山河叙事。地图长卷 + 留白美学，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/chama-trail/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/chama-trail/", "team": [{"name": "马千里", "role": "独立创作"}], "theme": "从云南到西藏的千年商路地图长卷，马帮铃铛声里的山河叙事", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "地图长卷 + 留白美学，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	马千里	2026-09-14 23:35:55.518021+08	2026-09-14 23:35:55.518021+08	\N	23	web-marathon-2026q3
134	source	活字工坊	常印	网页设计	活字印刷互动工坊：字架、捡字、排版、拓印，一页走完千年印刷流程。拟物木纹 + 交互排版，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/movable-type-studio/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/movable-type-studio/", "team": [{"name": "常印", "role": "独立创作"}], "theme": "活字印刷互动工坊：字架、捡字、排版、拓印，一页走完千年印刷流程", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "拟物木纹 + 交互排版，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	常印	2026-09-14 23:35:55.518388+08	2026-09-14 23:35:55.518388+08	\N	25	web-marathon-2026q3
135	source	琥珀昆虫档案馆	柯岩	网页设计	穿越亿万年时光的琥珀标本馆，每只昆虫都是一座时间胶囊。暖棕色调 + 标本陈列式布局，源码已收录社团源码展示库，点击作品可直接在线浏览。	/showcase/amber-insect-archive/thumbnail.png	Art 素材仓库 · web_mock		{"link": "/showcase/amber-insect-archive/", "team": [{"name": "柯岩", "role": "独立创作"}], "theme": "穿越亿万年时光的琥珀标本馆，每只昆虫都是一座时间胶囊", "layout": "showcase", "source": "Art 素材仓库 · web_mock", "process": [{"note": "9-26 上午直播间抽取命题盲盒", "stage": "抽题"}, {"note": "暖棕色调 + 标本陈列式布局，48 小时内独立完成", "stage": "开发"}, {"note": "源码收录社团源码展示库，直挂大屏轮播", "stage": "上线"}]}	approved	t	柯岩	2026-09-14 23:35:55.518749+08	2026-09-14 23:35:55.518749+08	\N	27	web-marathon-2026q3
137	skill	Anthropic Skills（官方技能库） —— 官方出品的 Agent Skills 合集	社团 Skill 精选	Skill 插件	Anthropic 官方维护的技能仓库，看官方怎么写 Skill 结构，照着抄就对了。（GitHub 176,210 stars） 官方简介：Public repository for Agent Skills	/showcase/skills/anthropic-skills.svg	GitHub 开源推荐		{"link": "https://github.com/anthropics/skills", "team": [{"name": "开源社区", "role": "作者"}], "theme": "官方出品的 Agent Skills 合集", "layout": "linkcard", "source": "GitHub 开源推荐", "process": [{"note": "第 1 期工坊拆解项目", "stage": "推荐"}]}	approved	t	社团 Skill 精选	2026-09-14 23:35:55.534328+08	2026-09-14 23:35:55.534328+08	\N	6	skill-workshop-2026q4
138	skill	MarkItDown —— 微软出品：万物转 Markdown	社团 Skill 精选	Skill 插件	Word / PPT / Excel / PDF 一键转 Markdown，喂给大模型前的第一道工序，社团知识库入库全靠它。（GitHub 183,820 stars） 官方简介：Python tool for converting files and office documents to Markdown.	/showcase/skills/markitdown.svg	GitHub 开源推荐		{"link": "https://github.com/microsoft/markitdown", "team": [{"name": "开源社区", "role": "作者"}], "theme": "微软出品：万物转 Markdown", "layout": "linkcard", "source": "GitHub 开源推荐", "process": [{"note": "第 1 期工坊拆解项目", "stage": "推荐"}]}	approved	t	社团 Skill 精选	2026-09-14 23:35:55.535227+08	2026-09-14 23:35:55.535227+08	\N	10	skill-workshop-2026q4
139	skill	browser-use —— 让 agent 真正会用浏览器	社团 Skill 精选	Skill 插件	把浏览器交给 agent 操作：填表、抓取、点按钮，写自动化脚本的同事人手一个。（GitHub 114,570 stars） 官方简介：Agents that use the browser.	/showcase/skills/browser-use.svg	GitHub 开源推荐		{"link": "https://github.com/browser-use/browser-use", "team": [{"name": "开源社区", "role": "作者"}], "theme": "让 agent 真正会用浏览器", "layout": "linkcard", "source": "GitHub 开源推荐", "process": [{"note": "第 1 期工坊拆解项目", "stage": "推荐"}]}	approved	t	社团 Skill 精选	2026-09-14 23:35:55.535802+08	2026-09-14 23:35:55.535802+08	\N	14	skill-workshop-2026q4
140	skill	MCP Servers（参考服务器） —— MCP 生态的官方参考实现合集	社团 Skill 精选	Skill 插件	Model Context Protocol 官方参考服务器：文件系统、搜索、数据库接入怎么写，都在这里。（GitHub 90,309 stars） 官方简介：Model Context Protocol Servers	/showcase/skills/mcp-servers.svg	GitHub 开源推荐		{"link": "https://github.com/modelcontextprotocol/servers", "team": [{"name": "开源社区", "role": "作者"}], "theme": "MCP 生态的官方参考实现合集", "layout": "linkcard", "source": "GitHub 开源推荐", "process": [{"note": "第 1 期工坊拆解项目", "stage": "推荐"}]}	approved	t	社团 Skill 精选	2026-09-14 23:35:55.536369+08	2026-09-14 23:35:55.536369+08	\N	18	skill-workshop-2026q4
141	skill	OpenHands —— 开源软件工程 agent 平台	社团 Skill 精选	Skill 插件	前 OpenDevin：一个能改代码、跑测试、提 PR 的完整 agent 平台，适合团队内部部署体验。（GitHub 87,844 stars） 官方简介：🙌 OpenHands: AI-Driven Development	/showcase/skills/openhands.svg	GitHub 开源推荐		{"link": "https://github.com/OpenHands/OpenHands", "team": [{"name": "开源社区", "role": "作者"}], "theme": "开源软件工程 agent 平台", "layout": "linkcard", "source": "GitHub 开源推荐", "process": [{"note": "第 1 期工坊拆解项目", "stage": "推荐"}]}	approved	t	社团 Skill 精选	2026-09-14 23:35:55.536881+08	2026-09-14 23:35:55.536881+08	\N	22	skill-workshop-2026q4
142	skill	Crawl4AI —— 为 LLM 而生的爬虫	社团 Skill 精选	Skill 插件	专为喂大模型设计的爬虫：自动转 Markdown、去噪、适配 RAG，做资料类 Skill 的黄金搭档。（GitHub 83,430 stars） 官方简介：🚀🤖 Crawl4AI: Open-source LLM Friendly Web Crawler & Scraper. Don't be shy, join here: https://discord.gg/jP8KfhDhyN	/showcase/skills/crawl4ai.svg	GitHub 开源推荐		{"link": "https://github.com/unclecode/crawl4ai", "team": [{"name": "开源社区", "role": "作者"}], "theme": "为 LLM 而生的爬虫", "layout": "linkcard", "source": "GitHub 开源推荐", "process": [{"note": "第 1 期工坊拆解项目", "stage": "推荐"}]}	approved	t	社团 Skill 精选	2026-09-14 23:35:55.537319+08	2026-09-14 23:35:55.537319+08	\N	26	skill-workshop-2026q4
143	skill	LobeChat —— 一句话搭出团队聊天机器人	社团 Skill 精选	Skill 插件	插件生态丰富的开源聊天框架，把内部工具包装成机器人给全组用，低成本高回报。（GitHub 82,464 stars） 官方简介：🤯 LobeHub is your Chief Agent Operator, organizing your agents into 7×24 operations by hiring, scheduling, and reporting	/showcase/skills/lobechat.svg	GitHub 开源推荐		{"link": "https://github.com/lobehub/lobehub", "team": [{"name": "开源社区", "role": "作者"}], "theme": "一句话搭出团队聊天机器人", "layout": "linkcard", "source": "GitHub 开源推荐", "process": [{"note": "第 1 期工坊拆解项目", "stage": "推荐"}]}	approved	t	社团 Skill 精选	2026-09-14 23:35:55.537876+08	2026-09-14 23:35:55.537876+08	\N	28	skill-workshop-2026q4
144	image	「珠小团」社团吉祥物 · 标准形象设计稿	温叙	美术资源	为丽珠 AI 社团设计的官方吉祥物：胶囊 + 珍珠原型的 Q 版形象，含正面 / 侧面 / 背面与三视图规范稿。AI 生成 + 手工精修。	/showcase/art/set1_image_1.jpg	社团设计组 · AI 辅助创作		{"style": "吉祥物设计", "theme": "为丽珠 AI 社团设计的官方吉祥物：胶囊 + 珍珠原型的 Q 版形象，含正面 / 侧面 / 背面与三视图规范稿", "tools": "AI 生成 + 手工精修", "layout": "gallery", "gallery": ["/showcase/art/set1_image_1.jpg", "/showcase/art/set1_image_2.jpg", "/showcase/art/set1_image_3.jpg", "/showcase/art/set1_image_4.jpg"]}	approved	t	温叙	2026-09-14 23:35:55.538362+08	2026-09-14 23:35:55.538362+08	\N	4	aigc-season-2026a
145	image	「珠小团」表情与动作延展稿	温叙	美术资源	吉祥物的动作表情延展：庆祝、点赞、思考、加油四连，可直接用于群表情与活动物料。AI 生成 + 手工精修。	/showcase/art/set2_image_1.jpg	社团设计组 · AI 辅助创作		{"style": "吉祥物设计", "theme": "吉祥物的动作表情延展：庆祝、点赞、思考、加油四连，可直接用于群表情与活动物料", "tools": "AI 生成 + 手工精修", "layout": "gallery", "gallery": ["/showcase/art/set2_image_1.jpg", "/showcase/art/set2_image_2.jpg", "/showcase/art/set2_image_3.jpg", "/showcase/art/set2_image_4.jpg"]}	approved	t	温叙	2026-09-14 23:35:55.538796+08	2026-09-14 23:35:55.538796+08	\N	8	aigc-season-2026a
146	image	社团 App 功能图标集 · 四风格设计稿	柯岩	美术资源	为社团应用设计的功能图标集：首页 / 活动 / 作品墙 / 消息等 9 枚图标，线性、面性、毛玻璃、3D 四种风格稿。AI 生成 + 手工精修。	/showcase/art/set3_image_1.jpg	社团设计组 · AI 辅助创作		{"style": "UI 美术资产", "theme": "为社团应用设计的功能图标集：首页 / 活动 / 作品墙 / 消息等 9 枚图标，线性、面性、毛玻璃、3D 四种风格稿", "tools": "AI 生成 + 手工精修", "layout": "gallery", "gallery": ["/showcase/art/set3_image_1.jpg", "/showcase/art/set3_image_2.jpg", "/showcase/art/set3_image_3.jpg", "/showcase/art/set3_image_4.jpg"]}	approved	t	柯岩	2026-09-14 23:35:55.539343+08	2026-09-14 23:35:55.539343+08	\N	12	aigc-season-2026a
147	image	社团 App 按钮与组件设计稿	柯岩	美术资源	为社团应用设计的 UI 组件规范：按钮三态、标签徽章、卡片、表单输入，后期开发直接取用。AI 生成 + 手工精修。	/showcase/art/set4_image_1.jpg	社团设计组 · AI 辅助创作		{"style": "UI 美术资产", "theme": "为社团应用设计的 UI 组件规范：按钮三态、标签徽章、卡片、表单输入，后期开发直接取用", "tools": "AI 生成 + 手工精修", "layout": "gallery", "gallery": ["/showcase/art/set4_image_1.jpg", "/showcase/art/set4_image_2.jpg", "/showcase/art/set4_image_3.jpg", "/showcase/art/set4_image_4.jpg"]}	approved	t	柯岩	2026-09-14 23:35:55.539756+08	2026-09-14 23:35:55.539756+08	\N	16	aigc-season-2026a
148	image	系列插画「自然与科技」	叶浮生	美术资源	齿轮藤蔓森林、数据河流、电路树叶、月下机器人与鹿——当自然遇见科技的四幅回答。AI 生成 + 手工精修。	/showcase/art/set5_image_1.jpg	社团设计组 · AI 辅助创作		{"style": "插画", "theme": "齿轮藤蔓森林、数据河流、电路树叶、月下机器人与鹿——当自然遇见科技的四幅回答", "tools": "AI 生成 + 手工精修", "layout": "gallery", "gallery": ["/showcase/art/set5_image_1.jpg", "/showcase/art/set5_image_2.jpg", "/showcase/art/set5_image_3.jpg", "/showcase/art/set5_image_4.jpg"]}	approved	t	叶浮生	2026-09-14 23:35:55.540165+08	2026-09-14 23:35:55.540165+08	\N	20	aigc-season-2026a
149	image	系列插画「城市与人」	常晚	美术资源	雨夜霓虹、天台日出、地铁读书人、黄昏晾衣绳——城市角落里的人与光。AI 生成 + 手工精修。	/showcase/art/set6_image_1.jpg	社团设计组 · AI 辅助创作		{"style": "插画", "theme": "雨夜霓虹、天台日出、地铁读书人、黄昏晾衣绳——城市角落里的人与光", "tools": "AI 生成 + 手工精修", "layout": "gallery", "gallery": ["/showcase/art/set6_image_1.jpg", "/showcase/art/set6_image_2.jpg", "/showcase/art/set6_image_3.jpg", "/showcase/art/set6_image_4.jpg"]}	approved	t	常晚	2026-09-14 23:35:55.540552+08	2026-09-14 23:35:55.540552+08	\N	24	aigc-season-2026a
\.


--
-- Name: activity_letters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_letters_id_seq', 1, false);


--
-- Name: activity_reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_reminders_id_seq', 36, true);


--
-- Name: activity_reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_reservations_id_seq', 44, true);


--
-- Name: activity_signups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_signups_id_seq', 109, true);


--
-- Name: artifacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.artifacts_id_seq', 17, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 150, true);


--
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.registrations_id_seq', 3, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.votes_id_seq', 13, true);


--
-- Name: works_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.works_id_seq', 149, true);


--
-- Name: activities activities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activities
    ADD CONSTRAINT activities_pkey PRIMARY KEY (id);


--
-- Name: activity_letters activity_letters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_letters
    ADD CONSTRAINT activity_letters_pkey PRIMARY KEY (id);


--
-- Name: activity_reminders activity_reminders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reminders
    ADD CONSTRAINT activity_reminders_pkey PRIMARY KEY (id);


--
-- Name: activity_reservations activity_reservations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reservations
    ADD CONSTRAINT activity_reservations_pkey PRIMARY KEY (id);


--
-- Name: activity_signup_forms activity_signup_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_signup_forms
    ADD CONSTRAINT activity_signup_forms_pkey PRIMARY KEY (activity_id);


--
-- Name: activity_signups activity_signups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_signups
    ADD CONSTRAINT activity_signups_pkey PRIMARY KEY (id);


--
-- Name: artifacts artifacts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifacts
    ADD CONSTRAINT artifacts_pkey PRIMARY KEY (id);


--
-- Name: assets assets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_pkey PRIMARY KEY (id);


--
-- Name: comment_likes comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_pkey PRIMARY KEY (comment_id, user_id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: community_config community_config_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.community_config
    ADD CONSTRAINT community_config_pkey PRIMARY KEY (id);


--
-- Name: direct_messages direct_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: post_likes post_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_pkey PRIMARY KEY (post_id, user_id);


--
-- Name: posts posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_pkey PRIMARY KEY (id);


--
-- Name: registrations registrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (sid);


--
-- Name: showcase_sites showcase_sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_sites
    ADD CONSTRAINT showcase_sites_pkey PRIMARY KEY (slug);


--
-- Name: signup_form_templates signup_form_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.signup_form_templates
    ADD CONSTRAINT signup_form_templates_pkey PRIMARY KEY (id);


--
-- Name: activity_reminders uq_reminder_res_kind; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reminders
    ADD CONSTRAINT uq_reminder_res_kind UNIQUE (reservation_id, kind);


--
-- Name: activity_reservations uq_res_user_activity; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reservations
    ADD CONSTRAINT uq_res_user_activity UNIQUE (user_id, activity_id);


--
-- Name: activity_signups uq_signup_user_activity; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_signups
    ADD CONSTRAINT uq_signup_user_activity UNIQUE (user_id, activity_id);


--
-- Name: users uq_users_open_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_open_id UNIQUE (open_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- Name: work_comment_likes work_comment_likes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_comment_likes
    ADD CONSTRAINT work_comment_likes_pkey PRIMARY KEY (comment_id, user_id);


--
-- Name: work_comments work_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_comments
    ADD CONSTRAINT work_comments_pkey PRIMARY KEY (id);


--
-- Name: works works_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT works_pkey PRIMARY KEY (id);


--
-- Name: idx_act_kind; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_act_kind ON public.activities USING btree (kind, sort);


--
-- Name: idx_activity_letters_asset; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_activity_letters_asset ON public.activity_letters USING btree (asset_id);


--
-- Name: idx_artifacts_asset; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artifacts_asset ON public.artifacts USING btree (asset_id);


--
-- Name: idx_artifacts_work; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_artifacts_work ON public.artifacts USING btree (work_id);


--
-- Name: idx_assets_cat_backend; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assets_cat_backend ON public.assets USING btree (category, backend);


--
-- Name: idx_assets_ref; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assets_ref ON public.assets USING btree (storage_url);


--
-- Name: idx_assets_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assets_user ON public.assets USING btree (user_id);


--
-- Name: idx_assets_user_checksum; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_assets_user_checksum ON public.assets USING btree (user_id, checksum);


--
-- Name: idx_comments_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_parent ON public.comments USING btree (parent_id);


--
-- Name: idx_comments_post; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_comments_post ON public.comments USING btree (post_id);


--
-- Name: idx_dm_pair; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_pair ON public.direct_messages USING btree (sender_id, receiver_id, created_at DESC);


--
-- Name: idx_dm_receiver; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_dm_receiver ON public.direct_messages USING btree (receiver_id, created_at DESC);


--
-- Name: idx_letter_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_letter_activity ON public.activity_letters USING btree (activity_id, created_at DESC);


--
-- Name: idx_letter_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_letter_user ON public.activity_letters USING btree (user_id);


--
-- Name: idx_notif_unread; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_unread ON public.notifications USING btree (user_id) WHERE (read = false);


--
-- Name: idx_notif_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notif_user ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: idx_posts_alive; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_alive ON public.posts USING btree (deleted) WHERE (deleted = false);


--
-- Name: idx_posts_created; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_created ON public.posts USING btree (created_at DESC);


--
-- Name: idx_posts_pinned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_pinned ON public.posts USING btree (pinned);


--
-- Name: idx_posts_section; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_posts_section ON public.posts USING btree (section);


--
-- Name: idx_reg_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reg_activity ON public.registrations USING btree (activity);


--
-- Name: idx_reg_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reg_status ON public.registrations USING btree (status);


--
-- Name: idx_reg_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_reg_user ON public.registrations USING btree (user_id);


--
-- Name: idx_res_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_res_activity ON public.activity_reservations USING btree (activity_id);


--
-- Name: idx_sessions_expire; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_sessions_expire ON public.sessions USING btree (expire);


--
-- Name: idx_showcase_work; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_showcase_work ON public.showcase_sites USING btree (work_id);


--
-- Name: idx_signup_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signup_activity ON public.activity_signups USING btree (activity_id);


--
-- Name: idx_signups_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signups_status ON public.activity_signups USING btree (status);


--
-- Name: idx_tpl_updated; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_tpl_updated ON public.signup_form_templates USING btree (updated_at DESC);


--
-- Name: idx_votes_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_votes_user ON public.votes USING btree (user_id);


--
-- Name: idx_votes_work; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_votes_work ON public.votes USING btree (work_id);


--
-- Name: idx_wc_alive; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wc_alive ON public.work_comments USING btree (deleted) WHERE (deleted = false);


--
-- Name: idx_wc_parent; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wc_parent ON public.work_comments USING btree (parent_id);


--
-- Name: idx_wc_work; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_wc_work ON public.work_comments USING btree (work_id);


--
-- Name: idx_works_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_works_activity ON public.works USING btree (activity_id) WHERE (activity_id <> ''::text);


--
-- Name: idx_works_category; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_works_category ON public.works USING btree (category);


--
-- Name: idx_works_kind; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_works_kind ON public.works USING btree (kind);


--
-- Name: idx_works_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_works_status ON public.works USING btree (status);


--
-- Name: idx_works_user; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_works_user ON public.works USING btree (user_id);


--
-- Name: idx_works_wall_order; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_works_wall_order ON public.works USING btree (wall_order) WHERE (wall_order IS NOT NULL);


--
-- Name: uq_votes_pool_day; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_votes_pool_day ON public.votes USING btree (voter_id, activity_id, vote_date) WHERE (id > 6);


--
-- Name: uq_works_wall_order; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_works_wall_order ON public.works USING btree (wall_order) WHERE (wall_order IS NOT NULL);


--
-- Name: activity_letters activity_letters_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_letters
    ADD CONSTRAINT activity_letters_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- Name: activity_letters activity_letters_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_letters
    ADD CONSTRAINT activity_letters_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- Name: activity_letters activity_letters_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_letters
    ADD CONSTRAINT activity_letters_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: activity_reminders activity_reminders_reservation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reminders
    ADD CONSTRAINT activity_reminders_reservation_id_fkey FOREIGN KEY (reservation_id) REFERENCES public.activity_reservations(id) ON DELETE CASCADE;


--
-- Name: activity_reservations activity_reservations_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reservations
    ADD CONSTRAINT activity_reservations_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- Name: activity_reservations activity_reservations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_reservations
    ADD CONSTRAINT activity_reservations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: activity_signup_forms activity_signup_forms_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_signup_forms
    ADD CONSTRAINT activity_signup_forms_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- Name: activity_signups activity_signups_activity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_signups
    ADD CONSTRAINT activity_signups_activity_id_fkey FOREIGN KEY (activity_id) REFERENCES public.activities(id) ON DELETE CASCADE;


--
-- Name: activity_signups activity_signups_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_signups
    ADD CONSTRAINT activity_signups_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- Name: activity_signups activity_signups_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.activity_signups
    ADD CONSTRAINT activity_signups_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: artifacts artifacts_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifacts
    ADD CONSTRAINT artifacts_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.assets(id) ON DELETE SET NULL;


--
-- Name: artifacts artifacts_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.artifacts
    ADD CONSTRAINT artifacts_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: assets assets_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.assets
    ADD CONSTRAINT assets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: comment_likes comment_likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE;


--
-- Name: comment_likes comment_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_likes
    ADD CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: comments comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.comments(id) ON DELETE SET NULL;


--
-- Name: comments comments_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: comments comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: direct_messages direct_messages_receiver_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: direct_messages direct_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.direct_messages
    ADD CONSTRAINT direct_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_post_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE;


--
-- Name: post_likes post_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.post_likes
    ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: posts posts_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: posts posts_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.posts
    ADD CONSTRAINT posts_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE SET NULL;


--
-- Name: registrations registrations_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.registrations
    ADD CONSTRAINT registrations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: showcase_sites showcase_sites_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.showcase_sites
    ADD CONSTRAINT showcase_sites_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE SET NULL;


--
-- Name: votes votes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: votes votes_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: work_comment_likes work_comment_likes_comment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_comment_likes
    ADD CONSTRAINT work_comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.work_comments(id) ON DELETE CASCADE;


--
-- Name: work_comment_likes work_comment_likes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_comment_likes
    ADD CONSTRAINT work_comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: work_comments work_comments_parent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_comments
    ADD CONSTRAINT work_comments_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.work_comments(id) ON DELETE SET NULL;


--
-- Name: work_comments work_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_comments
    ADD CONSTRAINT work_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: work_comments work_comments_work_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.work_comments
    ADD CONSTRAINT work_comments_work_id_fkey FOREIGN KEY (work_id) REFERENCES public.works(id) ON DELETE CASCADE;


--
-- Name: works works_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.works
    ADD CONSTRAINT works_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

