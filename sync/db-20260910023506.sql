--
-- PostgreSQL database dump
--

\restrict NK6bRv4p0TeF06FZiACXr7jXIg2fua159HVL3tnCmyGXcxWpoLkkVq6gdu53prE

-- Dumped from database version 15.18
-- Dumped by pg_dump version 15.18

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
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_work_id_fkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
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
DROP INDEX IF EXISTS public.uq_votes_voter_work;
DROP INDEX IF EXISTS public.idx_works_user;
DROP INDEX IF EXISTS public.idx_works_status;
DROP INDEX IF EXISTS public.idx_works_kind;
DROP INDEX IF EXISTS public.idx_works_category;
DROP INDEX IF EXISTS public.idx_wc_work;
DROP INDEX IF EXISTS public.idx_wc_parent;
DROP INDEX IF EXISTS public.idx_wc_alive;
DROP INDEX IF EXISTS public.idx_votes_work;
DROP INDEX IF EXISTS public.idx_votes_user;
DROP INDEX IF EXISTS public.idx_signups_status;
DROP INDEX IF EXISTS public.idx_signup_activity;
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
ALTER TABLE IF EXISTS ONLY public.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY public.registrations DROP CONSTRAINT IF EXISTS registrations_pkey;
ALTER TABLE IF EXISTS ONLY public.posts DROP CONSTRAINT IF EXISTS posts_pkey;
ALTER TABLE IF EXISTS ONLY public.post_likes DROP CONSTRAINT IF EXISTS post_likes_pkey;
ALTER TABLE IF EXISTS ONLY public.notifications DROP CONSTRAINT IF EXISTS notifications_pkey;
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
DROP TABLE IF EXISTS public.sessions;
DROP SEQUENCE IF EXISTS public.registrations_id_seq;
DROP TABLE IF EXISTS public.registrations;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.post_likes;
DROP SEQUENCE IF EXISTS public.notifications_id_seq;
DROP TABLE IF EXISTS public.notifications;
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
    start_at timestamp with time zone
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
    updated_at timestamp with time zone DEFAULT now() NOT NULL
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
    user_id integer
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
    user_id integer
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

COPY public.activities (id, kind, title, date_label, location, tag, sort, data, updated_at, start_at) FROM stdin;
skill-salon-aug	current	SKILL 实用技能午间沙龙	8月31日 周五 · 11:00-14:00	204 会议室 / 休闲区	本周焦点	0	{"id": "skill-salon-aug", "tag": "本周焦点", "date": "2026-08-31", "desc": "报名时在群里回复想分享的方向，必须参与讨论和投屏演示（workflow、prompts、截图、demo、经验），不局限于工作场景。", "name": "SKILL 实用技能午间沙龙", "color": "#5b8cff", "signup": "/upload.html", "status": "ongoing", "location": "204 会议室 / 休闲区", "dateLabel": "8月31日 周五 · 11:00-14:00", "highlights": ["办公场景自动化", "生活实用小工具", "数据玩法与可视化", "效率工具开发"]}	2026-09-08 10:11:49.429977+08	\N
ai-microfilm	upcoming	AI 微电影创作赛	9月 · 全月征集	线上 + 线下展映会	深度活动	0	{"id": "ai-microfilm", "tag": "深度活动", "date": "2026-09", "desc": "月初发布主题，参与者 T+3 日内报名，T+25~30 日提交作品，次月月初小型作品展示会，像看产品发布会一样轮流播放讨论。", "name": "AI 微电影创作赛", "color": "#c38d9e", "status": "upcoming", "location": "线上 + 线下展映会", "start_at": "2026-09-30T18:00+08:00", "dateLabel": "9月 · 全月征集", "highlights": ["1-3分钟短片", "1-2人组队", "奖金激励", "影视鉴赏氛围"]}	2026-09-08 10:11:49.438261+08	2026-09-30 18:00:00+08
vibe-coding	upcoming	Vibe Coding 沙龙	10月 · 待定	204 会议室	动手实操	1	{"id": "vibe-coding", "tag": "动手实操", "date": "2026-10", "desc": "围绕「氛围感」进行代码创作，用最新模型快速生成一个有强烈氛围的交互网页/小游戏/视觉生成器。现场或线上同步 coding。", "name": "Vibe Coding 沙龙", "color": "#85dcba", "status": "upcoming", "location": "204 会议室", "start_at": "2026-10-15T14:00+08:00", "dateLabel": "10月 · 待定", "highlights": ["限时创作", "2-3人组队", "最有氛围奖", "即时反馈"]}	2026-09-08 10:11:49.439493+08	2026-10-15 14:00:00+08
skill-hackathon	upcoming	Skill 开发黑客松	11月 · 待定	全天封闭式开发	硬核挑战	2	{"id": "skill-hackathon", "tag": "硬核挑战", "date": "2026-11", "desc": "提前 1 周征集候选方向，现场投票选定 2-3 个，每人独立开发。把 skill 发给所有人在各自 agent 上实测评分。", "name": "Skill 开发黑客松", "color": "#7f9cf5", "status": "upcoming", "location": "全天封闭式开发", "start_at": "2026-11-15T09:00+08:00", "dateLabel": "11月 · 待定", "highlights": ["单人开发", "实测评分", "最实用奖", "最稳健奖"]}	2026-09-08 10:11:49.439997+08	2026-11-15 09:00:00+08
ai-design-salon	upcoming	AI 设计沙龙	12月 · 待定	204 会议室	创作分享	3	{"id": "ai-design-salon", "tag": "创作分享", "date": "2026-12", "desc": "AI 海报、AI 音乐、AI 表情包、AI 配音、AI 创作类 skill。现场每人 10-15 分钟轮流展示 + 拆解工作流。", "name": "AI 设计沙龙", "color": "#f6ad55", "status": "upcoming", "location": "204 会议室", "start_at": "2026-12-15T14:00+08:00", "dateLabel": "12月 · 待定", "highlights": ["海报设计", "音乐创作", "表情包", "工作流拆解"]}	2026-09-08 10:11:49.440481+08	2026-12-15 14:00:00+08
frontier-talk	upcoming	前沿模型开发者讲座	每季度 1 次	闭门小型讲座（8-12人）	硬核分享	4	{"id": "frontier-talk", "tag": "硬核分享", "date": "2026-Q", "desc": "邀请 Qwen、DeepSeek、InternLM 等开源模型核心贡献者、高校 AI 实验室年轻研究员、独立研究者做深度分享。", "name": "前沿模型开发者讲座", "color": "#9f7aea", "status": "upcoming", "location": "闭门小型讲座（8-12人）", "start_at": null, "dateLabel": "每季度 1 次", "highlights": ["小范围深度", "模型训练", "前沿进展", "高质量交流"]}	2026-09-08 10:11:49.440972+08	\N
prompt-camp-3	past	AI 训练营 · 第 3 期	2026-05 · 8 周	线下集训 + 异步作业	已结营	0	{"id": "prompt-camp-3", "tag": "已结营", "date": "2026-05", "name": "AI 训练营 · 第 3 期", "color": "#e8a87c", "stats": {"works": 12, "inWall": 8, "participants": 35}, "status": "past", "summary": "35 名学员完成从 Prompt 基础到工作流搭建的 8 周系统学习，产出 12 件结业作品，其中 8 件进入本期作品巨幕。", "location": "线下集训 + 异步作业", "artifacts": [{"note": "8 件入选作品巨幕", "type": "结营作品集", "count": 12}, {"note": "导师点评全程", "type": "结营路演录屏"}, {"note": "8 个主题模块", "type": "课件 / 讲义"}], "dateLabel": "2026-05 · 8 周"}	2026-09-08 10:11:49.441474+08	\N
tech-salon-8	past	技术沙龙 · 第 8 期	2026-06	内部会议室	已举办	1	{"id": "tech-salon-8", "tag": "已举办", "date": "2026-06", "name": "技术沙龙 · 第 8 期", "color": "#7f9cf5", "stats": {"docs": 3, "sessions": 4, "participants": 24}, "status": "past", "summary": "围绕「RAG / Agent / Fine-tuning 实战」四场深度分享，含现场 demo，沉淀了 3 篇工程实践文档进入知识库。", "location": "内部会议室", "artifacts": [{"type": "分享录屏", "count": 4}, {"note": "进入飞书知识库", "type": "实践文档", "count": 3}], "dateLabel": "2026-06"}	2026-09-08 10:11:49.442644+08	\N
project-clinic-2	past	项目实战 · 第 2 期	2026-07 · 6 周	跨部门小组协作	结项	2	{"id": "project-clinic-2", "tag": "结项", "date": "2026-07", "name": "项目实战 · 第 2 期", "color": "#85dcba", "stats": {"mvp": 6, "teams": 6, "production": 2}, "status": "past", "summary": "6 个跨部门小组各交付一个 AI 应用 MVP，其中「实验室自动化」与「数字孪生园区」进入生产环境，本季最亮眼的一期。", "location": "跨部门小组协作", "artifacts": [{"type": "结项展示", "count": 6}, {"note": "经安全评审后可复用", "type": "MVP 源码"}], "dateLabel": "2026-07 · 6 周"}	2026-09-08 10:11:49.443228+08	\N
share-summer-26	past	内部分享 · 2026 夏季场	2026-08	午间 12:30-13:30	已举办	3	{"id": "share-summer-26", "tag": "已举办", "date": "2026-08", "name": "内部分享 · 2026 夏季场", "color": "#c38d9e", "stats": {"speakers": 14, "avgMinutes": 22}, "status": "past", "summary": "14 位同事报名分享，覆盖工具、踩坑、小技巧，氛围最轻松的一场。优秀分享者获社团年度分享奖提名。", "location": "午间 12:30-13:30", "artifacts": [{"type": "分享集锦录屏"}, {"note": "参与者共同维护", "type": "小技巧速查表"}], "dateLabel": "2026-08"}	2026-09-08 10:11:49.443811+08	\N
\.


--
-- Data for Name: activity_letters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_letters (id, activity_id, user_id, name, dept, note, file_name, file_size, storage_url, created_at, asset_id) FROM stdin;
1	ai-design-salon	1	朱曦策		����Ͷ��	����.csv	8	/uploads/assets/doc/ast-mts6pgm6-766cde.csv	2026-09-08 12:43:36.417475+08	\N
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
1	ai-microfilm	1	朱曦策			2026-09-08 10:35:10.213712+08
3	frontier-talk	1	朱曦策			2026-09-08 14:43:49.288636+08
\.


--
-- Data for Name: activity_signup_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_signup_forms (activity_id, profile, updated_at) FROM stdin;
\.


--
-- Data for Name: activity_signups; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.activity_signups (id, activity_id, user_id, name, dept, contact, note, created_at, upload, response, asset_id, status, updated_at) FROM stdin;
1	skill-salon-aug	1	朱曦策				2026-09-08 10:34:05.154935+08	{}	{}	\N	approved	2026-09-10 09:37:59.591027+08
6	skill-salon-aug	2	张晋泰				2026-09-10 10:08:20.424511+08	{}	{}	\N	approved	2026-09-10 10:11:55.323578+08
\.


--
-- Data for Name: artifacts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.artifacts (id, work_id, kind, filename, version, size, storage_url, checksum, downloads, guide, created_at, asset_id) FROM stdin;
1	1	source	��ʾ�����.zip	v1	8	/uploads/assets/program/ast-mts6pbck-9e3ca3.zip		0		2026-09-08 12:43:29.594503+08	\N
\.


--
-- Data for Name: assets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.assets (id, user_id, category, backend, kind, name, size, storage_url, checksum, repo_url, remote_url, remote_status, agent_report, stage, guide, downloads, created_at, updated_at, source) FROM stdin;
ast-mts5y5rl-7e436d	1	media	local	doc	test_media.txt	21	/uploads/assets/media/ast-mts5y5rk-3cc20d.txt								1	2026-09-08 12:22:22.642652+08	2026-09-08 12:22:22.642652+08	
ast-mts5z0qt-8b806b	1	media	local	image	_t.png	69	/uploads/assets/media/ast-mts5z0qs-598421.png								0	2026-09-08 12:23:02.790741+08	2026-09-08 12:23:02.790741+08	
ast-mts5yqja-27b851	1	program	remote	miniprogram	示例程序	1024	https://resource.livzon.local/p/42		http://gitlab.livzon.local/demo.git	https://resource.livzon.local/p/42	online	[PASS] 已提交审核，资源中心已发布\nURL: ...	submitted	见 README	2	2026-09-08 12:22:49.560085+08	2026-09-08 12:22:49.560085+08	
ast-mts7a1pg-b65bc5	1	doc	local		资产导入模板.xlsx	4570	/uploads/assets/doc/ast-mts7a1pf-4d975e.xlsx								1	2026-09-08 12:59:36.869014+08	2026-09-08 12:59:36.869014+08	
ast-mts6u538-0a8a82	1	media	local	image	_t.png	69	/uploads/assets/media/ast-mts6u536-7c88e8.png								1	2026-09-08 12:47:14.75793+08	2026-09-08 12:47:14.75793+08	
ast-mts6pghe-e7bb31	1	doc	local	file	_d.csv	8	/uploads/assets/doc/ast-mts6pgh7-1def27.csv								4	2026-09-08 12:43:36.244082+08	2026-09-08 12:43:36.244082+08	
ast-mtuw9t7d-ba71d6	1	media	local	image	screenshot-20260819-164319.png	2509	/uploads/assets/media/ast-mtuw9t7b-ffd243.png								0	2026-09-10 10:14:48.602015+08	2026-09-10 10:14:48.602015+08	
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
c-mtuwapef-b78ecc	p-mtuw9t7n-dcbfcf	\N	1	朱曦策		能啊能啊	0	f	2026-09-10 10:15:30.328181+08
\.


--
-- Data for Name: community_config; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.community_config (id, data, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, body, link, read, created_at, activity_id, stage) FROM stdin;
1	1	signup	报名成功	活动「SKILL 实用技能午间沙龙」报名成功，请准时参加。	#activities	t	2026-09-08 10:34:05.160744+08	skill-salon-aug	signup
2	1	reserve	已收到您的预约	活动「AI 微电影创作赛」预约成功，开始前将通过飞书通知您。	#activities	t	2026-09-08 10:35:10.217314+08	ai-microfilm	reserve
3	1	reserve	已收到您的预约	活动「前沿模型开发者讲座」预约成功，开始前将通过飞书通知您。	#activities	t	2026-09-08 14:43:49.296589+08	frontier-talk	reserve
5	1	admin-signup	新报名待审批	活动「SKILL 实用技能午间沙龙」收到新报名：张晋泰	#admin	f	2026-09-10 10:08:21.954746+08	skill-salon-aug	admin
4	2	signup	报名已提交	活动「SKILL 实用技能午间沙龙」报名已提交，审核通过后将另行通知。	#activities	t	2026-09-10 10:08:20.437677+08	skill-salon-aug	signup
6	2	signup-result	报名已通过	活动「SKILL 实用技能午间沙龙」的报名已通过审核，请准时参加。	#activities	f	2026-09-10 10:11:55.328538+08	skill-salon-aug	result
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
p-mts714pt-40a558	1	朱曦策		资源下载验证：_d.csv 一起分享	resource	\N	\N	[]	[{"url": "/api/assets/ast-mts6pghe-e7bb31/download", "name": "_d.csv", "size": 8}]	f	\N	0	f	2026-09-08 12:52:40.86643+08
p-mtuw9t7n-dcbfcf	1	朱曦策		hhh能不能看到	chat	\N	\N	[{"url": "/uploads/assets/media/ast-mtuw9t7b-ffd243.png", "name": "screenshot-20260819-164319.png"}]	[]	f	\N	0	f	2026-09-10 10:14:48.611788+08
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
v_tvNpaUytVxHr29UuE_HgXPkqMEZa-P	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-15T04:21:33.936Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789446097561
KTRqTByqhfX_CYGnJhzicL9oACZDM7wQ	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T01:49:48.515Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789609788852
GN-ddlpVkArhgi1uEdlMolqtKaD_Hq5D	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T01:50:02.221Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789609802358
zfN4DXCedHYgVLcB9Ffd-6tdDU7KPX2U	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T01:50:17.787Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789609818141
NYKhw3AzjGxOacrKRgHYoc7sDMpe8Thb	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-15T04:22:22.310Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789446187632
5rFf43kIf0tAHHv030BXf05xMuN5dhWn	{"name": "张晋泰", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T02:06:04.050Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 2}	1789611486773
bxE2-SovrOSaliuXsrl3YG2IcpUkJsgh	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T02:07:09.620Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789612298587
vbrJwmhQgkMXY0waV8VEHpm9Nxf1Gcto	{"cookie": {"path": "/", "expires": "2026-09-17T02:04:26.042Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "authState": "52fe7ef0c33faac4f347351da6151b03"}	1789610666042
Rb1nsNtwUZYv1OxaUNp2rAJochgZBisc	{"cookie": {"path": "/", "expires": "2026-09-17T02:04:43.057Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "authState": "4c909b97049a440174d4cb96c9d22366"}	1789610683057
vXoFyurWUWQnsbvJyWtcnM2MPCocmfSQ	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-15T04:49:05.789Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789447990381
Hj1K7-obNZqOtgVBi1qjp4zaFhCgMWNN	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-17T01:40:19.257Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789609219660
OI2fgA2MsAs6icMmJVtBStLt2R-CXQ40	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-15T02:30:11.794Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789609912974
CWQiWtrVLizCNEKw3BR11fIgu7X65vRE	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-15T04:43:29.103Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789447416421
hCDyVxTM_1uQ6MU0LmOmWqXvjZvJILNP	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-15T04:50:04.078Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604799999}, "userId": 1}	1789612478864
iKKidOgNkowUkdY7Wy30u8sTsAxSFAT1	{"name": "朱曦策", "role": "admin", "cookie": {"path": "/", "expires": "2026-09-15T04:47:05.895Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "userId": 1}	1789447634759
OasmH0xNIi6pBwBiJBfab-LMkRvuek4V	{"cookie": {"path": "/", "expires": "2026-09-17T02:25:39.180Z", "httpOnly": true, "sameSite": "lax", "originalMaxAge": 604800000}, "authState": "972eb648b2e394f860979ed625a1aa27"}	1789611939180
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, open_id, name, email, department, role, created_at, union_id, avatar, status, access_token, token_expire, last_login_at) FROM stdin;
1	ou_0f592124153e2b55d7f097f8d6d46e4d	朱曦策			admin	2026-09-08 10:30:17.684888+08	on_bc046f92f8303df6c8e883381d1d9df9	https://s3-imfile.feishucdn.com/static-resource/v1/v3_0014h_bab60a02-c32d-4b02-a933-17fb9098b98g~?image_size=72x72&cut_type=&quality=&format=image&sticker_format=.webp	active		\N	2026-09-10 10:07:16.513+08
2	ou_b271586ff3e5a516fe59a1885e3eee9a	张晋泰			admin	2026-09-10 10:06:07.964658+08	on_f2cafde9493cd7537d39714b479d3df6	https://s3-imfile.feishucdn.com/static-resource/v1/v3_0015d_6ffdccb3-ee39-49de-bab7-f49e226762bg~?image_size=72x72&cut_type=&quality=&format=image&sticker_format=.webp	active		\N	2026-09-10 10:06:07.957+08
\.


--
-- Data for Name: votes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.votes (id, voter_id, activity_id, work_id, created_at, user_id) FROM stdin;
1	1		20	2026-09-08 13:06:41.148496+08	1
2	1		5	2026-09-08 13:06:47.641442+08	1
3	1		10	2026-09-10 09:18:40.268354+08	1
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
wc-mtuu9uqv-9bd03c	10	\N	1	朱曦策		6525	0	f	2026-09-10 09:18:51.379654+08
\.


--
-- Data for Name: works; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.works (id, kind, title, author, category, description, cover, source, session, detail, status, published, created_by, created_at, updated_at, user_id) FROM stdin;
1	image	樱落星湖	品牌市场部 · 赵婷	AI 图像	用 Midjourney 重现千禧年日系动漫美学，探索 AI 生成的情感表达边界。	images/works/w01.jpeg	AI 训练营 · 第 3 期 · 2026-05	第 01 期	{"link": "", "team": [{"name": "赵婷", "role": "主创 · Prompt 设计"}, {"name": "吴梦", "role": "美术顾问"}, {"name": "何斌", "role": "后期修图"}], "theme": "以「樱花坠入星夜之湖」为核心意象，延续千禧年日系赛璐璐动画的色彩语言，低饱和青蓝底色上只保留樱粉一个暖色声部，让情绪落在水面倒影的破碎光斑上。整组图像刻意保留手绘颗粒与镜头呼吸感，讨论 AI 生成画面里「不完美质感」的情感价值。", "source": "AI 训练营 · 第 3 期 · 2026-05", "process": [{"note": "确定「星湖夜樱」主题与情绪板，整理 30 组参考图", "time": "2026-05", "stage": "开发"}, {"note": "Midjourney 迭代 120+ 张，筛出 9 张正片", "time": "2026-06", "stage": "内测"}, {"note": "部门内部试映收集 15 条修改意见", "time": "2026-07", "stage": "发布"}, {"note": "入选本期作品墙，评审得分 4.6/5", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
2	image	星尘守望者	生物信息部 · 刘洋	AI 图像	科幻主题创作，从草图到成图的完整工作流演示。	images/works/w02.jpeg	AI 训练营 · 第 3 期 · 2026-05	第 01 期	{"link": "", "team": [{"name": "刘洋", "role": "主创 · 工作流设计"}, {"name": "张倩", "role": "草图绘制"}], "theme": "守望者站在星尘坠落的高原上，画面用广角低机位营造孤独而坚定的纪念碑感；灵感来自科幻插画黄金时代的构图法则，但光影渲染完全由 AI 完成，验证「经典构图 + AI 光影」的生产可能性。", "source": "AI 训练营 · 第 3 期 · 2026-05", "process": [{"note": "手绘 3 版构图草图确定机位与比例", "time": "2026-05", "stage": "开发"}, {"note": "AI 从草图到成图 4 轮迭代，锁定色彩方案", "time": "2026-06", "stage": "内测"}, {"note": "研发中心内部展示，收集科学家视角反馈", "time": "2026-07", "stage": "发布"}, {"note": "作品墙发布，附完整工作流文档", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
3	3d	深海水晶	研发中心 · 李明	3D 生成	基于 Luma AI 的 3D 资产生成实验，用于新药分子可视化。	images/works/w03.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "李明", "role": "主创 · 3D 管线"}, {"name": "周舟", "role": "分子数据校对"}, {"name": "赵婷", "role": "视觉指导"}], "theme": "用 Luma AI 生成水晶质感的三维分子资产，再叠加真实 PDB 结构数据；透明介质的折射与内部的几何骨架形成「科学数据浪漫化」的表达，让非科研同事也能一眼理解分子之美。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "选定 3 个候选靶点分子并导出结构数据", "time": "2026-06", "stage": "开发"}, {"note": "Luma 生成 + Blender 精修的混合管线搭建", "time": "2026-07", "stage": "内测"}, {"note": "与研发团队逐帧核对结构准确性", "time": "2026-08", "stage": "发布"}, {"note": "发布为研发沟通素材库首批资产", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
4	image	云端古刹	医学事务部 · 王芳	AI 图像	东方玄幻风格图像生成，探讨 prompt 叙事能力。	images/works/w04.jpeg	AI 训练营 · 第 3 期 · 2026-05	第 01 期	{"link": "", "team": [{"name": "王芳", "role": "主创 · Prompt 叙事"}, {"name": "郑远", "role": "文案共创"}], "theme": "悬浮于云海之上的古刹，用东方玄幻的竖轴构图讲述「山即是寺」的概念；prompt 以叙事段落而非关键词堆砌书写，探索长文本 prompt 对画面叙事密度的提升。", "source": "AI 训练营 · 第 3 期 · 2026-05", "process": [{"note": "撰写 500 字场景叙事文本作为 prompt 基底", "time": "2026-05", "stage": "开发"}, {"note": "生成 60 张，按叙事密度评分筛选", "time": "2026-06", "stage": "内测"}, {"note": "医学事务部内部分享会试讲", "time": "2026-07", "stage": "发布"}, {"note": "作品墙上线，评为本季最佳叙事奖", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
5	video	赛博雨夜	数字化部 · 张伟	AI 视频	Runway Gen-3 动态转绘实验，把实拍街道转换为赛博朋克风格。	images/works/w05.jpeg	技术沙龙 · 第 8 期 · 2026-06	第 01 期	{"link": "", "team": [{"name": "张伟", "role": "主创 · 视频转绘"}, {"name": "林涛", "role": "素材拍摄"}], "theme": "把雨夜实拍街道经 Runway Gen-3 转绘为赛博朋克都市，霓虹反射与雨水轨迹保持物理合理；核心议题是「风格迁移后运动一致性」——转绘后行人步态、雨丝方向不能穿帮。", "source": "技术沙龙 · 第 8 期 · 2026-06", "process": [{"note": "雨夜实拍 12 段 4K 素材并稳定处理", "time": "2026-06", "stage": "开发"}, {"note": "Runway 逐段转绘 + 关键帧一致性修正", "time": "2026-07", "stage": "内测"}, {"note": "数字化部内部放映，记录穿帮清单", "time": "2026-08", "stage": "发布"}, {"note": "技术沙龙现场演示并发布工作流", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
6	image	冥想之境	人力资源部 · 郑远	AI 图像	灵性主题系列创作，用图像探索内在平静的视觉表达。	images/works/w06.jpeg	内部分享 · 2026 夏季场 · 2026-08	第 01 期	{"link": "", "team": [{"name": "郑远", "role": "主创 · 概念设计"}], "theme": "灵性冥想主题的三联画：静、观、空。色彩从暖橙渐入冷紫再归于灰白，暗示冥想的三个阶段；用图像这种不需要语言的媒介，向同事传递「内在平静」的体验。", "source": "内部分享 · 2026 夏季场 · 2026-08", "process": [{"note": "确定三联画结构与色彩情绪曲线", "time": "2026-05", "stage": "开发"}, {"note": "生成与筛选 45 张，保证三联气质统一", "time": "2026-06", "stage": "内测"}, {"note": "人力资源部心理健康周预展", "time": "2026-07", "stage": "发布"}, {"note": "内部分享现场展出", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
7	image	仙山楼阁	供应链部 · 孙磊	AI 图像	国风仙侠场景生成，用于企业文化宣传素材。	images/works/w07.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "孙磊", "role": "主创 · 视觉设计"}, {"name": "赵婷", "role": "品牌审核"}], "theme": "国风仙侠山门场景，为企业文化宣传储备的东方视觉资产库首发作品；强调留白与云雾层次，克制使用高饱和色，让画面服务于「传承与探索」的企业叙事。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "品牌视觉规范对齐，确定色彩边界", "time": "2026-06", "stage": "开发"}, {"note": "生成 80 张并按规范筛出 6 张入库", "time": "2026-07", "stage": "内测"}, {"note": "宣传物料 A/B 试投对比效果", "time": "2026-08", "stage": "发布"}, {"note": "作品墙发布，资产库同步上线", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
8	image	蒸汽图书馆	信息部 · 林涛	AI 图像	复古未来主义风格实验，多种风格融合的 prompt 工程。	images/works/w08.jpeg	技术沙龙 · 第 8 期 · 2026-06	第 01 期	{"link": "", "team": [{"name": "林涛", "role": "主创 · 风格实验"}, {"name": "张伟", "role": "Prompt 融合测试"}], "theme": "蒸汽朋克图书馆：黄铜齿轮机械检索塔与蒸汽管道书架的组合，用复古未来主义讨论「知识的机械化整理」这一命题，也是对信息部日常工作的自嘲式浪漫。", "source": "技术沙龙 · 第 8 期 · 2026-06", "process": [{"note": "3 种风格基底（蒸汽/包豪斯/装饰艺术）对比", "time": "2026-06", "stage": "开发"}, {"note": "风格融合 prompt 模板沉淀为文档", "time": "2026-07", "stage": "内测"}, {"note": "信息部内部技术茶话会演示", "time": "2026-08", "stage": "发布"}, {"note": "沙龙发布并开源 prompt 模板", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
9	image	异星行者	生产运营部 · 陈刚	AI 图像	从文本描述到概念图再到视频的完整产出管线。	images/works/w09.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "陈刚", "role": "主创 · 全流程"}, {"name": "王芳", "role": "世界观文本"}], "theme": "从一段 200 字的科幻短文出发，完成概念图、动态分镜到 30 秒短片的完整管线，验证单人借助 AI 独立完成「迷你宣传片」的可能性；异星行者的防护服设计参考了制药洁净服的真实结构。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "撰写世界观短文与角色设定", "time": "2026-06", "stage": "开发"}, {"note": "概念图 20 张 + 分镜 8 板", "time": "2026-07", "stage": "内测"}, {"note": "动态片段生成与剪辑合成", "time": "2026-08", "stage": "发布"}, {"note": "项目实战结营路演发布", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
10	tool	分子视界	研发中心 · 李明团队	科学可视化	蛋白质结构与分子动力学 AI 可视化，辅助药物研发沟通。	images/works/w10.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "李明", "role": "主创 · 可视化架构"}, {"name": "刘洋", "role": "算法与数据"}, {"name": "周琪", "role": "交互设计"}], "theme": "把蛋白质折叠过程做成可交互的 3D 可视化：折叠中间态按能量曲面着色，科研同事可直接拖拽旋转、按残基查看；目标是让药物研发沟通里「说清一个构象变化」的成本从 30 分钟降到 3 分钟。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "确定 3 个展示蛋白与关键构象状态", "time": "2026-06", "stage": "开发"}, {"note": "3D 渲染管线 + 数据接口开发", "time": "2026-07", "stage": "内测"}, {"note": "研发团队 20 人试用并迭代 3 版", "time": "2026-08", "stage": "发布"}, {"note": "项目结题发布，进入日常沟通素材库", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
11	tool	神经网络地图	生物信息部 · 刘洋团队	数据可视化	基因表达数据的降维可视化工具，自动生成交互式图谱。	images/works/w11.jpeg	技术沙龙 · 第 8 期 · 2026-06	第 01 期	{"link": "", "team": [{"name": "刘洋", "role": "主创 · 算法实现"}, {"name": "周舟", "role": "数据清洗"}], "theme": "基因表达降维图谱工具：UMAP 投影叠加聚类着色，悬停显示基因卡片；把生物信息部最常用的分析流程做成自助式交互图，非编程背景的实验同事也能自己探索数据结构。", "source": "技术沙龙 · 第 8 期 · 2026-06", "process": [{"note": "降维与聚类参数自动调优模块", "time": "2026-06", "stage": "开发"}, {"note": "交互式图谱前端开发", "time": "2026-07", "stage": "内测"}, {"note": "生物信息部 + 实验室联合试用", "time": "2026-08", "stage": "发布"}, {"note": "沙龙演示并开放内部使用", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
12	3d	晶簇几何	品牌市场部 · 赵婷团队	3D 设计	产品海报 3D 素材生成方案，效率提升 6 倍。	images/works/w12.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "赵婷", "role": "主创 · 设计系统"}, {"name": "孙磊", "role": "渲染参数"}], "theme": "为产品海报设计的 3D 素材生成方案：晶簇几何体的参数化生成 + 品牌光效模板，从需求到素材出图从 2 天压缩到 2 小时；本作品是方案的首批落地样张合集。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "梳理海报素材需求与品牌约束", "time": "2026-06", "stage": "开发"}, {"note": "参数化生成模板开发", "time": "2026-07", "stage": "内测"}, {"note": "市场部 3 个项目实测验收", "time": "2026-08", "stage": "发布"}, {"note": "发布内部素材生产线", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
13	app	全息病历	医学事务部 · 王芳团队	产品原型	临床数据全息展示概念设计，探索未来医疗交互。	images/works/w13.jpeg	内部分享 · 2026 夏季场 · 2026-08	第 01 期	{"link": "", "team": [{"name": "王芳", "role": "主创 · 概念设计"}, {"name": "周琪", "role": "人机交互顾问"}], "theme": "临床数据全息展示概念：医生手势旋转三维病历视图，生命体征以环绕图表漂浮在患者模型周围；探讨未来十年医疗交互的想象空间，为产品团队提供远期设计坐标。", "source": "内部分享 · 2026 夏季场 · 2026-08", "process": [{"note": "临床场景调研与需求访谈", "time": "2026-05", "stage": "开发"}, {"note": "概念分镜与交互原型制作", "time": "2026-06", "stage": "内测"}, {"note": "医学事务部 + 产品联合评审", "time": "2026-07", "stage": "发布"}, {"note": "夏季场分享并沉淀概念白皮书", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
14	image	实验室自动化	药厂 · AI 小组	实际应用	AI 引导的实验室自动化流程优化，效率提升 40%。	images/works/w14.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "陈刚", "role": "主创 · 工程实现"}, {"name": "李明", "role": "视觉模型"}, {"name": "孙磊", "role": "流程重构"}], "theme": "实验室自动化流程优化：用视觉模型识别仪器状态与耗材余量，自动编排排队与提醒；上线 3 个月，设备排队冲突下降 40%，是本季唯一进入生产环境的作品。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "产线痛点调研与方案设计", "time": "2026-06", "stage": "开发"}, {"note": "识别模型训练与流程编排开发", "time": "2026-07", "stage": "内测"}, {"note": "2 个月灰度试运行与调优", "time": "2026-08", "stage": "发布"}, {"note": "正式发布，纳入 SOP", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
15	video	魔法图书馆	品牌市场部 · 赵婷	AI 视频	Sora + Runway 混合工作流创作的品牌短片。	images/works/w15.jpeg	内部分享 · 2026 夏季场 · 2026-08	第 01 期	{"link": "", "team": [{"name": "赵婷", "role": "导演 · 整体统筹"}, {"name": "张伟", "role": "Sora 场景"}, {"name": "吴梦", "role": "剪辑调色"}], "theme": "品牌短片《魔法图书馆》：Sora 负责奇幻场景，Runway 负责实拍融合，讲述「知识生长」的品牌隐喻；三段式结构对应品牌理念的三次递进，配乐由 AI 辅助生成后人工精修。", "source": "内部分享 · 2026 夏季场 · 2026-08", "process": [{"note": "品牌理念转译为三幕叙事脚本", "time": "2026-05", "stage": "开发"}, {"note": "Sora/Runway 分工生成 90 段素材", "time": "2026-06", "stage": "内测"}, {"note": "粗剪 6 版 + 声画精修", "time": "2026-07", "stage": "发布"}, {"note": "夏季场首映", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
16	image	DNA 螺旋之舞	生物信息部 · 刘洋	数据艺术	将基因序列数据转化为动态视觉艺术。	images/works/w16.jpeg	技术沙龙 · 第 8 期 · 2026-06	第 01 期	{"link": "", "team": [{"name": "刘洋", "role": "主创 · 数据编舞"}, {"name": "郑远", "role": "视觉韵律"}], "theme": "把真实基因序列按碱基映射为色彩与节奏，编码区用明亮高频、非编码区用低沉长音，数据本身成为编舞谱；「数据艺术」不是装饰数据，而是让数据自己起舞。", "source": "技术沙龙 · 第 8 期 · 2026-06", "process": [{"note": "碱基-色彩-节奏映射规则设计", "time": "2026-06", "stage": "开发"}, {"note": "序列驱动生成管线开发", "time": "2026-07", "stage": "内测"}, {"note": "艺术性与准确性的双轨评审", "time": "2026-08", "stage": "发布"}, {"note": "沙龙现场展演", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
17	image	紫色星云	数字化部 · 张伟	AI 图像	天文主题背景素材批量生成 pipeline。	images/works/w17.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "张伟", "role": "主创 · 管线开发"}, {"name": "吴梦", "role": "质量抽检"}], "theme": "天文主题背景素材批量生成管线：星云色相、颗粒密度、构图三分参数化，一次产出 200 张符合品牌规范的后备素材；本作品展示管线产出中最受好评的 8 张。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "素材需求分类与参数矩阵设计", "time": "2026-06", "stage": "开发"}, {"note": "批生成 + 自动质检脚本", "time": "2026-07", "stage": "内测"}, {"note": "设计部门抽样验收", "time": "2026-08", "stage": "发布"}, {"note": "素材库上线", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
18	image	星辰少女	品牌市场部 · 赵婷	AI 图像	角色一致性实验，同角色多场景生成方法探索。	images/works/w18.jpeg	AI 训练营 · 第 3 期 · 2026-05	第 01 期	{"link": "", "team": [{"name": "赵婷", "role": "主创 · 方法研究"}, {"name": "吴梦", "role": "一致性评分"}], "theme": "角色一致性实验：同一位「星辰少女」出现在 12 个不同场景里，服装、脸型、气质保持统一；沉淀出角色锁定（character lock）的 7 条实操经验，是内部创作者最常引用的教程型作品。", "source": "AI 训练营 · 第 3 期 · 2026-05", "process": [{"note": "角色设定图与特征词表构建", "time": "2026-05", "stage": "开发"}, {"note": "12 场景生成与一致性比对", "time": "2026-06", "stage": "内测"}, {"note": "7 条经验总结成教程文档", "time": "2026-07", "stage": "发布"}, {"note": "训练营结营发布", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
19	tool	数据驾驶舱	信息部 · 林涛团队	BI 工具	AI 辅助的智能数据分析仪表盘，自动生成洞察报告。	images/works/w19.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "林涛", "role": "主创 · 前端架构"}, {"name": "张伟", "role": "NL2SQL 链路"}, {"name": "何斌", "role": "指标口径治理"}], "theme": "AI 辅助的智能数据驾驶舱：自然语言提问即可生成分析视图与洞察摘要，月度经营会上「临时想看的数据」不再需要排队等报表；本作品是驾驶舱的首屏与核心交互演示。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "高频临时取数需求清单梳理", "time": "2026-06", "stage": "开发"}, {"note": "NL2SQL + 可视化模版开发", "time": "2026-07", "stage": "内测"}, {"note": "财务/市场 2 个部门试用", "time": "2026-08", "stage": "发布"}, {"note": "月度经营会正式启用", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
20	image	数字脸影	数字化部 · 张伟	AI 艺术	用代码字符生成人像，探讨数字身份议题。	images/works/w20.jpeg	内部分享 · 2026 夏季场 · 2026-08	第 01 期	{"link": "", "team": [{"name": "张伟", "role": "主创 · 概念与实现"}], "theme": "用代码字符堆叠出人像剪影：代码是制药行业的语言，脸是人的身份，二者叠印讨论「数字时代我们由什么构成」；远看是人，近看是无数行真实的项目代码。", "source": "内部分享 · 2026 夏季场 · 2026-08", "process": [{"note": "字符密度与人像明度的映射算法", "time": "2026-05", "stage": "开发"}, {"note": "真实项目代码语料整理", "time": "2026-06", "stage": "内测"}, {"note": "多尺度可读性测试", "time": "2026-07", "stage": "发布"}, {"note": "夏季场展出", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
21	tool	创意工作流	董办 · 设计组	工作流	从创意 brief 到成品的 AI 辅助全流程分享。	images/works/w21.jpeg	内部分享 · 2026 夏季场 · 2026-08	第 01 期	{"link": "", "team": [{"name": "董办设计组", "role": "集体创作 · 赵婷牵头"}, {"name": "吴梦", "role": "流程梳理"}], "theme": "创意工作流分享：从 brief 到成品的全流程 AI 协作范式——需求翻译、参考收敛、生成迭代、人工精修四个关卡；附 5 个真实项目对照复盘，是设计组新人培训指定读物。", "source": "内部分享 · 2026 夏季场 · 2026-08", "process": [{"note": "5 个项目全过程留档复盘", "time": "2026-05", "stage": "开发"}, {"note": "四关卡工作流提炼", "time": "2026-06", "stage": "内测"}, {"note": "新人试用 2 轮迭代", "time": "2026-07", "stage": "发布"}, {"note": "夏季场发布 + 入培训教材", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
22	video	水墨舞者	品牌市场部 · 赵婷	AI 视频	舞蹈动作捕捉 + AI 风格转绘实验作品。	images/works/w22.jpeg	技术沙龙 · 第 8 期 · 2026-06	第 01 期	{"link": "", "team": [{"name": "赵婷", "role": "主创 · 美学设定"}, {"name": "陈刚", "role": "动捕数据处理"}], "theme": "水墨舞者：动作捕捉数据驱动 AI 水墨转绘，笔触浓淡随动作力度实时变化——轻盈处留白如宣纸，爆发处泼墨如骤雨；探索「中国美学 × 实时生成」的技术与美感平衡。", "source": "技术沙龙 · 第 8 期 · 2026-06", "process": [{"note": "舞者动作捕捉与数据清洗", "time": "2026-06", "stage": "开发"}, {"note": "力度-笔触映射算法开发", "time": "2026-07", "stage": "内测"}, {"note": "3 版浓淡曲线比对定稿", "time": "2026-08", "stage": "发布"}, {"note": "沙龙现场投屏展演", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
23	image	智慧工厂	药厂 · 数字化组	实际应用	基于数字孪生的智能工厂可视化平台。	images/works/w23.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "数字化组", "role": "集体创作 · 孙磊牵头"}, {"name": "林涛", "role": "数据接入"}, {"name": "陈刚", "role": "告警规则"}], "theme": "数字孪生智能工厂可视化平台：灌装线、仓储、能耗三维实时联动，异常点位自动高亮并推送处置建议；把「看得见的工厂」变成管理层的日常驾驶舱。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "产线三维建模与数据点位映射", "time": "2026-06", "stage": "开发"}, {"note": "实时数据管道与告警引擎", "time": "2026-07", "stage": "内测"}, {"note": "工厂 3 班组长试用 1 个月", "time": "2026-08", "stage": "发布"}, {"note": "生产例会正式接入", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
24	image	时间的记忆	研发中心 · 李明	AI 艺术	超现实主义风格系列创作，表达对时间的哲思。	images/works/w24.jpeg	AI 训练营 · 第 3 期 · 2026-05	第 01 期	{"link": "", "team": [{"name": "李明", "role": "主创 · 概念创作"}], "theme": "超现实主义时间主题组画：融化的钟、折叠的走廊、循环的阶梯，讨论「研发周期里的时间感知」；灵感来自部门讨论——为何一个实验周期在不同阶段体感完全不同。", "source": "AI 训练营 · 第 3 期 · 2026-05", "process": [{"note": "时间感知访谈与意象收集", "time": "2026-05", "stage": "开发"}, {"note": "超现实构图生成 70 张", "time": "2026-06", "stage": "内测"}, {"note": "研发中心内部展览", "time": "2026-07", "stage": "发布"}, {"note": "作品墙发布", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
25	image	色彩喷发	品牌市场部 · 赵婷	AI 图像	抽象表达主义风格实验，探索 AI 的艺术直觉。	images/works/w25.jpeg	AI 训练营 · 第 3 期 · 2026-05	第 01 期	{"link": "", "team": [{"name": "赵婷", "role": "主创 · 实验设计"}, {"name": "郑远", "role": "观察记录"}], "theme": "抽象表现主义色彩实验：让 AI 在没有具象目标的前提下自由喷发色彩，人类只做「选与停」的判断；试图回答——AI 有没有属于它自己的「艺术直觉」？", "source": "AI 训练营 · 第 3 期 · 2026-05", "process": [{"note": "无目标生成与自由采样协议", "time": "2026-05", "stage": "开发"}, {"note": "200 张样本的人工筛选记录", "time": "2026-06", "stage": "内测"}, {"note": "直觉存在性讨论稿撰写", "time": "2026-07", "stage": "发布"}, {"note": "训练营结营发布", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
26	image	信息流	信息部 · 林涛	数据艺术	将网络流量数据可视化为动态粒子艺术。	images/works/w26.jpeg	技术沙龙 · 第 8 期 · 2026-06	第 01 期	{"link": "", "team": [{"name": "林涛", "role": "主创 · 可视化"}, {"name": "何斌", "role": "流量数据"}], "theme": "把一周网络流量数据可视化为粒子洪流：协议类型决定颜色，流量大小决定粒子密度，攻击流量呈现为暗红色的涡旋；安全事件回溯时，「看」比「查」更快。", "source": "技术沙龙 · 第 8 期 · 2026-06", "process": [{"note": "流量数据脱敏与结构化", "time": "2026-06", "stage": "开发"}, {"note": "粒子系统渲染引擎选型", "time": "2026-07", "stage": "内测"}, {"note": "安全组回溯演练实测", "time": "2026-08", "stage": "发布"}, {"note": "沙龙发布并接入监控大屏", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
27	app	数字孪生园区	医疗创新中心 · 周琪团队	产品原型	全园区三维数字孪生模型，支持实时数据叠加。	images/works/w27.jpeg	项目实战 · 第二期 · 2026-07	第 01 期	{"link": "", "team": [{"name": "周琪", "role": "主创 · 孪生架构"}, {"name": "孙磊", "role": "建模管线"}, {"name": "林涛", "role": "数据融合"}], "theme": "全园区三维数字孪生模型：建筑、能耗、人流实时叠加，支持任意时间点回放；新员工入职业「云逛园区」，访客预约自动生成导览路径——孪生不止于监控。", "source": "项目实战 · 第二期 · 2026-07", "process": [{"note": "园区倾斜摄影与模型轻量化", "time": "2026-06", "stage": "开发"}, {"note": "实时数据融合层开发", "time": "2026-07", "stage": "内测"}, {"note": "行政 + IT 联合验收", "time": "2026-08", "stage": "发布"}, {"note": "上线试运行", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
28	image	空山独行	微球 · 创意小组	AI 图像	极简东方美学探索，少即是多的 AI 创作。	images/works/w28.jpeg	AI 训练营 · 第 3 期 · 2026-05	第 01 期	{"link": "", "team": [{"name": "创意小组", "role": "集体创作 · 微球牵头"}], "theme": "极简东方美学：大面积留白中一个孤行的背影，色彩不超过三种；检验「少即是多」在 AI 生成中的成立条件——约束越多，AI 越接近诗意。", "source": "AI 训练营 · 第 3 期 · 2026-05", "process": [{"note": "极简约束词表设计", "time": "2026-05", "stage": "开发"}, {"note": "留白比例受控生成", "time": "2026-06", "stage": "内测"}, {"note": "组内盲测 3 轮", "time": "2026-07", "stage": "发布"}, {"note": "训练营结营发布", "time": "2026-08", "stage": "评审"}]}	approved	t		2026-09-08 10:11:48.924717+08	2026-09-08 10:11:48.924717+08	\N
\.


--
-- Name: activity_letters_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_letters_id_seq', 1, true);


--
-- Name: activity_reminders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_reminders_id_seq', 1, false);


--
-- Name: activity_reservations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_reservations_id_seq', 3, true);


--
-- Name: activity_signups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.activity_signups_id_seq', 7, true);


--
-- Name: artifacts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.artifacts_id_seq', 1, true);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.notifications_id_seq', 6, true);


--
-- Name: registrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.registrations_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 2, true);


--
-- Name: votes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.votes_id_seq', 3, true);


--
-- Name: works_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.works_id_seq', 28, true);


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
-- Name: idx_signup_activity; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signup_activity ON public.activity_signups USING btree (activity_id);


--
-- Name: idx_signups_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_signups_status ON public.activity_signups USING btree (status);


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
-- Name: uq_votes_voter_work; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_votes_voter_work ON public.votes USING btree (voter_id, work_id);


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

\unrestrict NK6bRv4p0TeF06FZiACXr7jXIg2fua159HVL3tnCmyGXcxWpoLkkVq6gdu53prE

