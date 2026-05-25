--
-- PostgreSQL database dump
--

\restrict OKupgdeP2kPQrAMVVd9P5vtxIhK9yggY5mOJkBDajmdIxtfn0J7KEwanmENDcvC

-- Dumped from database version 16.11 (Debian 16.11-1.pgdg13+1)
-- Dumped by pg_dump version 16.11 (Debian 16.11-1.pgdg13+1)

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

--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: set_updated_at(); Type: FUNCTION; Schema: public; Owner: hris_user
--

CREATE FUNCTION public.set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_updated_at() OWNER TO hris_user;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: childrens; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.childrens (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    children_name jsonb,
    birth_date date,
    office_school character varying(255),
    occupation character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.childrens OWNER TO hris_user;

--
-- Name: departments; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.departments OWNER TO hris_user;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: hris_user
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO hris_user;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hris_user
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: designations; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.designations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.designations OWNER TO hris_user;

--
-- Name: designations_id_seq; Type: SEQUENCE; Schema: public; Owner: hris_user
--

CREATE SEQUENCE public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.designations_id_seq OWNER TO hris_user;

--
-- Name: designations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hris_user
--

ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;


--
-- Name: education_honors; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.education_honors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    education_id uuid NOT NULL,
    honor_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.education_honors OWNER TO hris_user;

--
-- Name: education_majors; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.education_majors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    education_id uuid NOT NULL,
    major_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.education_majors OWNER TO hris_user;

--
-- Name: education_minors; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.education_minors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    education_id uuid NOT NULL,
    minor_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.education_minors OWNER TO hris_user;

--
-- Name: education_scholarships; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.education_scholarships (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    education_id uuid NOT NULL,
    scholarship_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.education_scholarships OWNER TO hris_user;

--
-- Name: educational_qualifications; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.educational_qualifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    school character varying(255) NOT NULL,
    year_started integer,
    year_finished integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_year_range CHECK (((year_started IS NULL) OR (year_finished IS NULL) OR (year_finished >= year_started)))
);


ALTER TABLE public.educational_qualifications OWNER TO hris_user;

--
-- Name: employee_references; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.employee_references (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    name jsonb NOT NULL,
    address jsonb,
    contact_number character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.employee_references OWNER TO hris_user;

--
-- Name: employees; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.employees (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_no character varying(20) NOT NULL,
    employment_type character varying(20) NOT NULL,
    status character varying(20) DEFAULT 'DRAFT'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    photo_url text,
    user_id uuid,
    CONSTRAINT employees_employment_type_check CHECK (((employment_type)::text = ANY ((ARRAY['TEACHING'::character varying, 'NON_TEACHING'::character varying])::text[]))),
    CONSTRAINT employees_status_check CHECK (((status)::text = ANY ((ARRAY['DRAFT'::character varying, 'SUBMITTED'::character varying, 'ARCHIVED'::character varying])::text[])))
);


ALTER TABLE public.employees OWNER TO hris_user;

--
-- Name: employment_data; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.employment_data (
    employee_id uuid NOT NULL,
    date_hired date NOT NULL,
    position_id integer,
    designation_id integer,
    sss character varying(255),
    pagibig character varying(255),
    tax character varying(255),
    philhealth character varying(255),
    peraa character varying(255),
    employment_status character varying(255),
    employment_basis character varying(20),
    official_working_hours integer,
    other_employment character varying(255),
    other_employment_working_hours integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    salary numeric(12,2),
    CONSTRAINT chk_employment_status CHECK (((employment_status)::text = ANY ((ARRAY['REGULAR'::character varying, 'PROBATIONARY'::character varying, 'CONTRACTUAL'::character varying, 'RESIGNED'::character varying])::text[]))),
    CONSTRAINT employment_data_employment_basis_check CHECK (((employment_basis)::text = ANY ((ARRAY['FULL_TIME'::character varying, 'PART_TIME'::character varying, 'JOB_ORDER'::character varying])::text[])))
);


ALTER TABLE public.employment_data OWNER TO hris_user;

--
-- Name: employment_history; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.employment_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    start_date date NOT NULL,
    end_date date,
    "position" character varying(255) NOT NULL,
    employer character varying(255) NOT NULL,
    salary numeric(12,2),
    reason_for_leaving text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_employment_history_dates CHECK (((end_date IS NULL) OR (end_date >= start_date)))
);


ALTER TABLE public.employment_history OWNER TO hris_user;

--
-- Name: examinations_taken; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.examinations_taken (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    date_taken date NOT NULL,
    rating character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.examinations_taken OWNER TO hris_user;

--
-- Name: faculties; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.faculties (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    department_id integer,
    teaching_load text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.faculties OWNER TO hris_user;

--
-- Name: family_background; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.family_background (
    employee_id uuid NOT NULL,
    spouse jsonb,
    spouse_occupation character varying(255),
    nearest_kin_name jsonb,
    nearest_kin_address jsonb,
    nearest_kin_contact_number character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.family_background OWNER TO hris_user;

--
-- Name: leave_application_types; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.leave_application_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    leave_application_id uuid NOT NULL,
    leave_type_id integer NOT NULL,
    date_from date NOT NULL,
    date_to date NOT NULL,
    number_of_days numeric(5,1) NOT NULL,
    other_leave_details text
);


ALTER TABLE public.leave_application_types OWNER TO hris_user;

--
-- Name: leave_applications; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.leave_applications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    date_filed date DEFAULT CURRENT_DATE NOT NULL,
    reason text,
    department_unit character varying(255),
    substitute_name text,
    subjects_covered jsonb,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT leave_applications_status_check CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'DISAPPROVED'::character varying])::text[])))
);


ALTER TABLE public.leave_applications OWNER TO hris_user;

--
-- Name: leave_types; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.leave_types (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.leave_types OWNER TO hris_user;

--
-- Name: leave_types_id_seq; Type: SEQUENCE; Schema: public; Owner: hris_user
--

CREATE SEQUENCE public.leave_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.leave_types_id_seq OWNER TO hris_user;

--
-- Name: leave_types_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hris_user
--

ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;


--
-- Name: other_information; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.other_information (
    employee_id uuid NOT NULL,
    has_criminal_case boolean DEFAULT false NOT NULL,
    criminal_case_details text,
    has_admin_offense boolean DEFAULT false NOT NULL,
    admin_offense_details text,
    was_separated_employment boolean DEFAULT false NOT NULL,
    separation_details text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_admin_offense_details CHECK (((has_admin_offense = true) OR (admin_offense_details IS NULL))),
    CONSTRAINT chk_criminal_case_details CHECK (((has_criminal_case = true) OR (criminal_case_details IS NULL))),
    CONSTRAINT chk_separation_details CHECK (((was_separated_employment = true) OR (separation_details IS NULL)))
);


ALTER TABLE public.other_information OWNER TO hris_user;

--
-- Name: password_resets; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.password_resets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.password_resets OWNER TO hris_user;

--
-- Name: permissions; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.permissions (
    id integer NOT NULL,
    code character varying(50) NOT NULL
);


ALTER TABLE public.permissions OWNER TO hris_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: hris_user
--

CREATE SEQUENCE public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.permissions_id_seq OWNER TO hris_user;

--
-- Name: permissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hris_user
--

ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;


--
-- Name: personal_data; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.personal_data (
    employee_id uuid NOT NULL,
    last_name character varying(255) NOT NULL,
    first_name character varying(255) NOT NULL,
    middle_name character varying(255),
    name_extension character varying(20),
    sex character varying(20) NOT NULL,
    birth_date date NOT NULL,
    civil_status character varying(20),
    citizenship character varying(255),
    religion character varying(255),
    blood_type character varying(20),
    address jsonb,
    email character varying(255),
    contact_number character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT personal_data_sex_check CHECK (((sex)::text = ANY ((ARRAY['MALE'::character varying, 'FEMALE'::character varying])::text[])))
);


ALTER TABLE public.personal_data OWNER TO hris_user;

--
-- Name: positions; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.positions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);


ALTER TABLE public.positions OWNER TO hris_user;

--
-- Name: positions_id_seq; Type: SEQUENCE; Schema: public; Owner: hris_user
--

CREATE SEQUENCE public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_id_seq OWNER TO hris_user;

--
-- Name: positions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hris_user
--

ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;


--
-- Name: role_permissions; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.role_permissions OWNER TO hris_user;

--
-- Name: roles; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL
);


ALTER TABLE public.roles OWNER TO hris_user;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: hris_user
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO hris_user;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: hris_user
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: training_programs; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.training_programs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    place text,
    date_from date NOT NULL,
    date_to date,
    hours integer,
    conducted_by character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.training_programs OWNER TO hris_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: hris_user
--

CREATE TABLE public.users (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    email character varying(100) NOT NULL,
    password text NOT NULL,
    role character varying(20) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['ADMIN'::character varying, 'HR'::character varying, 'EMPLOYEE'::character varying])::text[])))
);


ALTER TABLE public.users OWNER TO hris_user;

--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: designations id; Type: DEFAULT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);


--
-- Name: leave_types id; Type: DEFAULT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);


--
-- Name: permissions id; Type: DEFAULT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);


--
-- Name: positions id; Type: DEFAULT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Data for Name: childrens; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.childrens (id, employee_id, children_name, birth_date, office_school, occupation, created_at, updated_at) FROM stdin;
f73831c6-2244-405a-9056-6542abf6c0e9	4b769217-7871-4b4d-96fb-e30eac1e381c	{"full_name": "Miguel Torres"}	2016-08-05	College	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
37db101e-cdfd-4bbf-9d5a-8529ab3bece3	09565e28-12a8-48b9-b85b-f96973ff77d7	{"full_name": "Olivia Flores"}	2012-11-03	College	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
82938bbe-7fb1-4af2-990c-148d1c22cbc3	09565e28-12a8-48b9-b85b-f96973ff77d7	{"full_name": "Emma Flores"}	2023-02-14	College	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
80d399cf-6e67-43ab-a86b-291eb75f1bb7	09565e28-12a8-48b9-b85b-f96973ff77d7	{"full_name": "Juan Reyes"}	2023-05-19	Elementary School	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
63719f08-faf8-4051-b747-710440f22793	d86db822-8838-417d-aa9f-a5de699ea7c9	{"full_name": "Noah Mendoza"}	2008-06-23	High School	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1f7f3f4e-8fa8-494b-ad30-ce65b2139bbc	d86db822-8838-417d-aa9f-a5de699ea7c9	{"full_name": "Sofia Bautista"}	2011-04-29	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
000fb023-b3de-4480-b1eb-f26191401483	bd0906b1-ca13-45ed-9638-d1297099fa8b	{"full_name": "Paolo Villanueva"}	2017-08-11	College	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f84a8a66-8798-4b5b-89b7-59a48aeca296	bd0906b1-ca13-45ed-9638-d1297099fa8b	{"full_name": "Rica Pineda"}	2023-06-15	College	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7f24feb9-04ff-4c52-9eb0-909f22db104b	243d02a5-8b94-49ba-9be1-ee2391df997d	{"full_name": "Patricia Bautista"}	2016-07-31	High School	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1f2318ce-b557-4eaa-8fb4-186a4132b34c	243d02a5-8b94-49ba-9be1-ee2391df997d	{"full_name": "Mark Mendoza"}	2013-05-18	\N	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
df667173-c323-4d77-9d1c-78d04643381b	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	{"full_name": "Jose Mercado"}	2014-12-19	High School	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4e5afd9a-722d-4b59-b4cb-f7690e7aa6f1	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	{"full_name": "Miguel Mendoza"}	2019-10-18	High School	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1ff4cad9-cadd-40f9-ab16-b1e5daeb6558	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	{"full_name": "Patricia Domingo"}	2023-05-15	Elementary School	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ffac85df-94ac-4ce3-8d64-af44015e6bdd	8503751d-84d4-4f15-be01-7b694fb99e03	{"full_name": "Ava Santos"}	2018-07-22	Elementary School	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c269a71c-35f0-4af1-b759-970ffa4a1a01	8503751d-84d4-4f15-be01-7b694fb99e03	{"full_name": "Carlo Villanueva"}	2014-09-27	Elementary School	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d9768216-4692-44e8-ac6d-91e612daabd1	8503751d-84d4-4f15-be01-7b694fb99e03	{"full_name": "Ava Torres"}	2012-02-10	College	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4b117a42-97f3-40dc-b603-d9b68255c213	5883754f-2fc6-4bbe-b32e-763336b0b9bb	{"full_name": "Emma Mendoza"}	2014-10-10	College	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6ae029ab-f84a-46cc-9359-5a402b493caf	5883754f-2fc6-4bbe-b32e-763336b0b9bb	{"full_name": "Ethan Flores"}	2019-04-02	\N	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1f18c19b-53e4-413f-a29b-472db2d28862	5883754f-2fc6-4bbe-b32e-763336b0b9bb	{"full_name": "Daniel Reyes"}	2011-01-10	College	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
74d4f866-600e-45f4-944d-61f657cffb89	4f2b038b-c39c-419f-8dc4-573312dfc81c	{"full_name": "Emma Garcia"}	2018-10-29	\N	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
dbd6f964-6f77-4f44-b65d-876f0ecd9544	5736e0e2-3c76-47e3-bc85-7362a0ba0810	{"full_name": "Olivia Castro"}	2022-07-03	\N	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
cf13116e-cf36-4e8b-831c-f99d28e3f87f	970c4aaf-e18c-4a44-98eb-6e1b363cdce1	{"full_name": "Sofia Domingo"}	2015-12-16	College	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ab67887c-cb7d-40d9-8e69-114183d6bdbf	970c4aaf-e18c-4a44-98eb-6e1b363cdce1	{"full_name": "Ethan Dela Cruz"}	2021-07-24	\N	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d20d6e62-4d28-47a8-a0c9-88e4d42e3086	6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	{"full_name": "Patricia Villanueva"}	2023-01-26	College	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5e976130-46ec-4fea-992e-5b747b6706e6	6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	{"full_name": "Angela Salazar"}	2016-08-01	High School	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0debb8e1-d60b-4627-9c2a-507f990aa992	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	{"full_name": "Jasmine Pineda"}	2021-05-21	College	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0ea7d565-790c-46d5-aca5-0626d24a71af	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	{"full_name": "Mark Santos"}	2021-12-30	College	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f7dc0b14-a5e3-490c-a2a9-4d7b99505291	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	{"full_name": "Miguel Aquino"}	2008-05-06	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
083d1ff7-8860-48fe-bec5-357495f0a435	a4f6e888-4d7a-4d44-8e37-a7813d848321	{"full_name": "Angela Villanueva"}	2008-08-15	Elementary School	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
34d50b9f-e851-4376-b66e-f6d69f68f765	a4f6e888-4d7a-4d44-8e37-a7813d848321	{"full_name": "Sofia Santos"}	2010-10-01	College	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d2d2b048-c953-4af7-bbcd-f015204461f5	51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	{"full_name": "Emma Flores"}	2022-06-17	Elementary School	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c1ce7884-015f-46a1-87b8-db3d57a8ba3a	0affd4fd-56f6-49dc-ab47-d191881ae9f6	{"full_name": "Carlo Dela Cruz"}	2019-08-17	College	None	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9b4240b2-a45e-457d-a812-3a032504b9ec	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	{"full_name": "Ava Reyes"}	2014-05-28	High School	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
13f2b9e4-098c-4b29-93da-a6d2a876389e	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	{"full_name": "Olivia Castro"}	2019-04-23	High School	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
65e0f801-83ea-433c-8c08-2beaef20d3b8	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	{"full_name": "Bea Villanueva"}	2010-05-16	College	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
51f8ed1e-0788-42d7-8a50-be5d6f9cde04	afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	{"full_name": "Ana Salazar"}	2014-10-21	High School	Student	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0d0ccdff-30d0-46bb-a950-ffe662d9fb04	a4f6e888-4d7a-4d44-8e37-a7813d848321	{"last_name": "Mercado", "first_name": "Michael", "middle_name": "Yolanda", "name_extension": ""}	2022-12-17			2026-03-26 03:24:30.523626	2026-03-26 11:52:24.17045
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.departments (id, name, description, is_active, created_at) FROM stdin;
2	CCS		t	2026-05-21 17:34:56.123303
3	Nursing		t	2026-05-21 19:56:34.704247
5	College of Education	Teacher education programs	t	2026-05-22 13:34:30.427642
6	College of Business	Business and management programs	t	2026-05-22 13:34:30.431698
7	College of Engineering	Engineering and technology programs	t	2026-05-22 13:34:30.433353
8	College of Arts and Sciences	Liberal arts and sciences programs	t	2026-05-22 13:34:30.434944
9	College of Nursing	Nursing and health sciences programs	t	2026-05-22 13:34:30.436554
10	College of Criminal Justice	Criminology and law enforcement programs	t	2026-05-22 13:34:30.438191
11	Senior High School	Senior High School department	t	2026-05-22 13:34:30.439992
12	Basic Education	Elementary and Junior High School	t	2026-05-22 13:34:30.441847
13	Administration	Administrative and non-teaching staff	t	2026-05-22 13:34:30.443344
14	Finance and Accounting	Finance, accounting, and budget staff	t	2026-05-22 13:34:30.444871
15	Human Resources	Human resources office	t	2026-05-22 13:34:30.446489
16	Information Technology	IT support and systems staff	t	2026-05-22 13:34:30.448207
17	Registrar	Registrar office	t	2026-05-22 13:34:30.44988
18	Library	Library services	t	2026-05-22 13:34:30.451551
19	Guidance and Counseling	Student guidance services	t	2026-05-22 13:34:30.453126
\.


--
-- Data for Name: designations; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.designations (id, name, description, is_active) FROM stdin;
1	Department Head	Leads a department	t
2	Coordinator	Coordinates unit operations	t
3	Staff	General staff designation	t
6	Hello World	Kaya yan	t
4	Assistant Siguro2	Assistant designation Siguro2	t
9	Dean	Leads a college or school	t
10	Program Coordinator	Coordinates a program or unit	t
14	Officer-in-Charge	Temporary head of a unit	t
13	Assistant	Assistant designation	t
\.


--
-- Data for Name: education_honors; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.education_honors (id, education_id, honor_name, created_at, updated_at) FROM stdin;
e35f960a-c421-4c71-a0f6-b91ad3e5fcc5	9d9a4a7e-0e32-495d-9512-55704699e13d	Academic Excellence Award	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
80686102-7ebf-4886-b9f0-c9ac9b46d79f	e15f5670-26d5-4483-ab61-577e0e75c6b6	Academic Excellence Award	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
fdb9fe76-60e2-43b3-a1e3-c4405f513222	de57a11d-5fa4-438a-9962-2c08d5a06782	Cum Laude	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9385060c-2966-4576-b4e3-2d5de99ac297	b4368887-44f0-4c6c-bf03-c3cd6d238c06	Academic Excellence Award	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
09cb3375-5c0d-4465-94bc-cc97d2c9ab78	852e7de1-9851-4ca4-a9c7-7671c126b927	Cum Laude	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
73a03de1-d78b-4716-a7c6-f5e0b0dd0081	979a1961-180b-4af3-af5b-02abad54889b	Cum Laude	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
071d6c95-c1eb-43a4-bb23-a9ef7bd95953	db5854a6-4997-486e-8b54-dba9eed7c8e9	Dean's Lister	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
726f35d3-27cb-43ae-8a58-41dee07e1eea	edf22c2a-3abf-4659-87df-3f44d8ea42a0	Academic Excellence Award	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
baccd5dd-8409-4896-a9b5-4a448544f8d2	eb19762d-30fb-44b4-9013-5c1d84f14b89	Dean's Lister	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
965f16e8-32a0-4b78-b1c8-813e11866a67	a0200b63-c764-4317-9335-4be238c5aa24	Dean's Lister	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a0675227-d268-4fb8-af6d-dd0e54901ac5	3728c5b1-e78a-4a30-9110-37459d86562a	Cum Laude	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9880dcad-466c-4486-9aac-a8d83898f21f	cc200a1d-36be-4c8c-b94a-9ca1b7925b37	Cum Laude	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2c26f46c-6624-432b-9676-b3f56ef1bc39	cfe1acb9-d9d3-40e6-8f9c-150b380aaea4	Dean's Lister	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b38f20c3-6e1a-44c4-bffe-34637ea36f4c	d6637f66-7943-45c9-b172-507434c17421	Dean's Lister	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
13c52001-8e8a-4532-8d6b-9e1001127a15	8beacd56-d73a-42c8-a18b-2de68a860516	Dean's Lister	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
175aefd6-b834-4b15-9ff7-ebc311c0b58a	c353a057-8ab1-4f2e-8e7a-eb60cff507d0	Dean's Lister	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: education_majors; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.education_majors (id, education_id, major_name, created_at, updated_at) FROM stdin;
bbac63c6-0829-4b00-9f79-027e8be42770	9d9a4a7e-0e32-495d-9512-55704699e13d	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
841c4ee2-7f08-413c-bc55-ab95836f9ad4	82e9cf81-82f5-4e88-9e6c-69a0a7a0d992	English	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
58bf4d41-b492-4319-abfc-28675ccc0ac5	e15f5670-26d5-4483-ab61-577e0e75c6b6	Management	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e06c5cfe-4c8d-4d84-83a6-7487001fe8f6	de57a11d-5fa4-438a-9962-2c08d5a06782	English	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
43426f33-330f-4cf5-b8ab-f4d703d50f23	9b1fa932-4bf6-48f9-99ae-e2088febdfb0	English	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8ec296bf-60fa-42fa-b220-16488f4a9aa6	b4368887-44f0-4c6c-bf03-c3cd6d238c06	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
df7e24d7-611a-4284-8033-296e0a22a9ee	852e7de1-9851-4ca4-a9c7-7671c126b927	Management	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ae8ec621-0f1a-47e3-8d97-33a14ce0c93b	979a1961-180b-4af3-af5b-02abad54889b	English	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a2fad57c-b375-41d2-a85b-524c7d63346b	fd14d2da-d7f2-4747-acc7-8bc9897013ff	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d41a5b84-d113-41fe-8169-c19f00ecc6d6	db5854a6-4997-486e-8b54-dba9eed7c8e9	English	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1e845098-d656-48d4-bb23-789f09dd69c9	60cce2e5-dd69-4a5d-8d22-f57e8f91cb2f	English	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d95b284b-6f8a-4f19-ba59-cc77d9bba4c0	edf22c2a-3abf-4659-87df-3f44d8ea42a0	Management	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
50e2f4f9-a63e-4d12-85f9-62ec61292c53	eb19762d-30fb-44b4-9013-5c1d84f14b89	Mathematics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c5963068-13eb-41ad-8a2f-5c7afb1e20c6	d70f0fd4-7452-419c-b65f-f5c2bcac4191	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6483e8ca-2de4-4f12-becf-c2859c86ef28	bf923f1e-a276-4d60-8113-b41d4842fb60	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9accf69e-206e-4ed6-bd6b-fc8cf8b6862e	53049f84-0262-4da7-969e-8e141f82fc77	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
336ed8e6-e11b-47e1-a741-c6d0002e7667	a0200b63-c764-4317-9335-4be238c5aa24	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
450b9571-28cb-4df0-b8fa-afd223ffadbe	1759257f-6899-4db4-ae10-2633d115aff2	English	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a295d239-779b-4c5d-a996-ca75fa2b3711	3728c5b1-e78a-4a30-9110-37459d86562a	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
89112673-7a82-4cd3-be77-03c6dbedc4f7	8173fd27-319a-4b53-b7d5-e243b217ae58	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2f1a4c32-4ac0-4a3e-8278-c248b538c78a	cc200a1d-36be-4c8c-b94a-9ca1b7925b37	Management	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
fea95771-fb50-4ce2-8365-1d620968fd19	cfe1acb9-d9d3-40e6-8f9c-150b380aaea4	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
131358b0-90eb-43ed-a156-ad3fa7bc3cf0	6b7a695a-d0e9-4b87-92e6-ada69c2f7c6a	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
838a3c01-f35a-45a2-958d-89e3da2176a9	d6637f66-7943-45c9-b172-507434c17421	Mathematics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6dfebb3e-0c2a-4ba3-a8f5-fad43d79ed38	63b1960e-41b9-437b-bc4a-61b0ff16797f	Mathematics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
35f478d2-95c2-4849-a0fb-bf927d035b09	f7beae18-b967-482f-8dfb-1c0d9ce37b03	Mathematics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
628cd9d7-ea1e-4f6f-a374-a0cde58aa3de	8beacd56-d73a-42c8-a18b-2de68a860516	Mathematics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b53a3c56-7c2c-4df1-8aaa-c90c8a8e2d50	0d902ab7-ba4b-4ee5-86ea-17dff8e22f72	Computer Science	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1baf5154-c22c-4d98-aa08-2f4fa3e526ed	b4c7719f-9da8-4590-8b63-02c5cbea55de	Mathematics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0b1defab-e3de-4e26-92a2-b8ace841f8af	c353a057-8ab1-4f2e-8e7a-eb60cff507d0	Mathematics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: education_minors; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.education_minors (id, education_id, minor_name, created_at, updated_at) FROM stdin;
0c64df80-7d14-48e6-a85c-f94047ed07ea	9d9a4a7e-0e32-495d-9512-55704699e13d	Statistics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
809b8cf6-6f59-49d1-83ec-667cb2cf5474	82e9cf81-82f5-4e88-9e6c-69a0a7a0d992	Public Policy	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2b493c9d-7427-4f7b-b48f-e9812ae64393	e15f5670-26d5-4483-ab61-577e0e75c6b6	Statistics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a22afe79-c5ea-410f-b677-5d18f12356db	de57a11d-5fa4-438a-9962-2c08d5a06782	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
eb3289d3-9b7d-4df7-b3a1-3df20de8865a	9b1fa932-4bf6-48f9-99ae-e2088febdfb0	Public Policy	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ff0789c9-7a53-454e-8164-627c59caf37c	b4368887-44f0-4c6c-bf03-c3cd6d238c06	Guidance	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7aabd918-fc53-4e44-a677-cae75fd535a2	852e7de1-9851-4ca4-a9c7-7671c126b927	Public Policy	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
474a85b1-be1f-43e6-88f8-6e56de85af1f	979a1961-180b-4af3-af5b-02abad54889b	Statistics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
788dbf87-888e-481f-96dd-40f315fa562c	fd14d2da-d7f2-4747-acc7-8bc9897013ff	Statistics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4e29b8d5-0ffe-4995-bf47-72226e7d0d68	db5854a6-4997-486e-8b54-dba9eed7c8e9	Guidance	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5393ccce-38b9-4f75-a2dd-2400697b6ec5	60cce2e5-dd69-4a5d-8d22-f57e8f91cb2f	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9699d898-853d-47e0-893b-a9f755eeed43	edf22c2a-3abf-4659-87df-3f44d8ea42a0	Guidance	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
52941446-220c-4754-ae9f-9ab13d0f1700	eb19762d-30fb-44b4-9013-5c1d84f14b89	Public Policy	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
513b71f7-26a8-4dfc-8386-7af7670564b9	d70f0fd4-7452-419c-b65f-f5c2bcac4191	Public Policy	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f9c47e6c-9bdb-4b46-bf5c-3f2b97f4192b	bf923f1e-a276-4d60-8113-b41d4842fb60	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
388ea0ee-884c-49cd-9016-36b3c722a148	53049f84-0262-4da7-969e-8e141f82fc77	Guidance	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8785a7b0-b335-47db-8edf-a44a3af3b1f2	a0200b63-c764-4317-9335-4be238c5aa24	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
36ce42bb-7248-438c-bc81-5c2a45a1a0f2	1759257f-6899-4db4-ae10-2633d115aff2	Statistics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8a3e1bb6-a805-4928-8c03-9f8d024b696c	3728c5b1-e78a-4a30-9110-37459d86562a	Public Policy	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
befc8d6d-c34f-4d95-ab2e-4661b01247b5	8173fd27-319a-4b53-b7d5-e243b217ae58	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
025b881f-1288-4ba4-9f1f-3d4dc62633ec	cc200a1d-36be-4c8c-b94a-9ca1b7925b37	Statistics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f251f2fe-9f27-4891-9a10-69a8a80afe36	cfe1acb9-d9d3-40e6-8f9c-150b380aaea4	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
67baaf2a-815a-49b0-8084-8bbeed766e90	6b7a695a-d0e9-4b87-92e6-ada69c2f7c6a	Guidance	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6f8cd19d-4ec2-4586-8e98-e31a74c9ccca	d6637f66-7943-45c9-b172-507434c17421	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
3e73f54e-a5af-4e81-927f-3dc0481bd208	63b1960e-41b9-437b-bc4a-61b0ff16797f	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c68a0db7-deba-4de8-8ad4-d738e54e9603	f7beae18-b967-482f-8dfb-1c0d9ce37b03	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f7fd6da6-20c9-4132-91a1-c1cfcb25acbe	8beacd56-d73a-42c8-a18b-2de68a860516	Statistics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
959508ef-6de0-4004-9b9d-d34623742f32	0d902ab7-ba4b-4ee5-86ea-17dff8e22f72	Statistics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
094e5640-e69b-4839-8799-0aaeb5eabacd	b4c7719f-9da8-4590-8b63-02c5cbea55de	Business Analytics	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
119ef9cc-4b59-451f-82e2-384166207bd1	c353a057-8ab1-4f2e-8e7a-eb60cff507d0	Guidance	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: education_scholarships; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.education_scholarships (id, education_id, scholarship_name, created_at, updated_at) FROM stdin;
52485a33-2e2c-4cac-926b-bd339628bec5	82e9cf81-82f5-4e88-9e6c-69a0a7a0d992	Academic Grant	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b68dfc5a-2513-45e9-b31a-e92708b8249c	e15f5670-26d5-4483-ab61-577e0e75c6b6	CHED Scholarship	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ad3d4413-bb5e-4eb4-84e5-59a1132aecc1	9b1fa932-4bf6-48f9-99ae-e2088febdfb0	Academic Grant	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0e4df661-4874-430a-9757-47bf4072dd00	fd14d2da-d7f2-4747-acc7-8bc9897013ff	Academic Grant	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
71b9f4bf-0766-4c1c-8e09-590033f2ed63	db5854a6-4997-486e-8b54-dba9eed7c8e9	Academic Grant	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1ce78871-e666-4148-8dd3-d253866f5ced	edf22c2a-3abf-4659-87df-3f44d8ea42a0	CHED Scholarship	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e6d27217-2cb1-4e4b-9793-b35e9132c18e	eb19762d-30fb-44b4-9013-5c1d84f14b89	CHED Scholarship	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b456b09f-458c-45cf-b9c7-bd2c5bebeb2f	53049f84-0262-4da7-969e-8e141f82fc77	LGU Scholarship	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
627e84f3-008c-4fa1-bba0-b0eb9897aacf	3728c5b1-e78a-4a30-9110-37459d86562a	CHED Scholarship	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
00e9ce25-9fa7-4824-ba04-03420d621201	8173fd27-319a-4b53-b7d5-e243b217ae58	CHED Scholarship	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1c076ae6-ce8e-4419-8069-2be622da6037	d6637f66-7943-45c9-b172-507434c17421	Academic Grant	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
73209902-ce75-4c22-878c-f61b85269bbe	8beacd56-d73a-42c8-a18b-2de68a860516	LGU Scholarship	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6d2ec2ad-a073-46b1-8cc3-1e947c74dc63	0d902ab7-ba4b-4ee5-86ea-17dff8e22f72	Academic Grant	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b6f14e02-b26d-46ed-8757-61998cd7f677	c353a057-8ab1-4f2e-8e7a-eb60cff507d0	CHED Scholarship	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: educational_qualifications; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.educational_qualifications (id, employee_id, title, school, year_started, year_finished, created_at, updated_at) FROM stdin;
9d9a4a7e-0e32-495d-9512-55704699e13d	4b769217-7871-4b4d-96fb-e30eac1e381c	Bachelor of Science in Education	Polytechnic University of the Philippines	2014	2017	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
82e9cf81-82f5-4e88-9e6c-69a0a7a0d992	09565e28-12a8-48b9-b85b-f96973ff77d7	Bachelor of Arts in Psychology	De La Salle University	2003	2003	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e15f5670-26d5-4483-ab61-577e0e75c6b6	d86db822-8838-417d-aa9f-a5de699ea7c9	Bachelor of Arts in Psychology	Ateneo de Manila University	2004	2009	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
de57a11d-5fa4-438a-9962-2c08d5a06782	04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	Bachelor of Arts in Psychology	University of the Philippines	2007	2007	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9b1fa932-4bf6-48f9-99ae-e2088febdfb0	553785c4-605f-44c8-907e-99151018f079	Master in Public Administration	University of the Philippines	2014	2019	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b4368887-44f0-4c6c-bf03-c3cd6d238c06	4ac742ce-72ee-426b-94c1-036739890960	Bachelor of Science in Information Technology	De La Salle University	2009	2012	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
852e7de1-9851-4ca4-a9c7-7671c126b927	fda81a86-ed25-4ba4-b9af-a0195f24794d	Bachelor of Science in Education	Polytechnic University of the Philippines	2000	2004	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
979a1961-180b-4af3-af5b-02abad54889b	807ce8f3-7088-4ebe-9507-d18fd626d08e	Master in Public Administration	Ateneo de Manila University	2001	2003	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
fd14d2da-d7f2-4747-acc7-8bc9897013ff	bd0906b1-ca13-45ed-9638-d1297099fa8b	Bachelor of Science in Information Technology	Mindanao State University	2013	2018	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
db5854a6-4997-486e-8b54-dba9eed7c8e9	15fcb03c-8d71-4634-8642-d30767d02ea4	Bachelor of Arts in Psychology	University of the Philippines	2007	2010	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
60cce2e5-dd69-4a5d-8d22-f57e8f91cb2f	4de74611-4e36-4b4d-becc-672303b61eca	Master in Public Administration	Polytechnic University of the Philippines	2005	2006	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
edf22c2a-3abf-4659-87df-3f44d8ea42a0	05ab41f7-955f-4594-8838-bf228269e2e7	Bachelor of Arts in Psychology	Polytechnic University of the Philippines	2012	2016	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
eb19762d-30fb-44b4-9013-5c1d84f14b89	243d02a5-8b94-49ba-9be1-ee2391df997d	Bachelor of Arts in Psychology	Mindanao State University	2019	2020	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d70f0fd4-7452-419c-b65f-f5c2bcac4191	a9655e0e-c848-4019-9cb8-4a4800fae8f1	Bachelor of Science in Education	Mindanao State University	2000	2004	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
bf923f1e-a276-4d60-8113-b41d4842fb60	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	Bachelor of Science in Education	University of the Philippines	2003	2009	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
53049f84-0262-4da7-969e-8e141f82fc77	8503751d-84d4-4f15-be01-7b694fb99e03	Bachelor of Science in Education	Ateneo de Manila University	2008	2012	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a0200b63-c764-4317-9335-4be238c5aa24	5883754f-2fc6-4bbe-b32e-763336b0b9bb	Master in Public Administration	De La Salle University	2005	2009	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1759257f-6899-4db4-ae10-2633d115aff2	4f2b038b-c39c-419f-8dc4-573312dfc81c	Bachelor of Arts in Psychology	Mindanao State University	2014	2018	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
3728c5b1-e78a-4a30-9110-37459d86562a	5736e0e2-3c76-47e3-bc85-7362a0ba0810	Bachelor of Science in Education	De La Salle University	2001	2004	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8173fd27-319a-4b53-b7d5-e243b217ae58	4e8191e5-1681-492c-8b1e-e009a8c542d1	Bachelor of Science in Information Technology	Polytechnic University of the Philippines	2002	2005	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
cc200a1d-36be-4c8c-b94a-9ca1b7925b37	970c4aaf-e18c-4a44-98eb-6e1b363cdce1	Bachelor of Arts in Psychology	Mindanao State University	2001	2002	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
cfe1acb9-d9d3-40e6-8f9c-150b380aaea4	6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	Bachelor of Science in Education	Mindanao State University	2007	2007	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6b7a695a-d0e9-4b87-92e6-ada69c2f7c6a	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	Bachelor of Science in Information Technology	Mindanao State University	2001	2005	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d6637f66-7943-45c9-b172-507434c17421	a4f6e888-4d7a-4d44-8e37-a7813d848321	Bachelor of Science in Information Technology	Mindanao State University	2014	2014	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
63b1960e-41b9-437b-bc4a-61b0ff16797f	b843a2fa-6035-4f64-998a-59ede57b3a5a	Master in Public Administration	Mindanao State University	2015	2016	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f7beae18-b967-482f-8dfb-1c0d9ce37b03	8d804703-fe50-4766-8ec9-d792c53b4d7f	Bachelor of Arts in Psychology	Mindanao State University	2003	2003	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8beacd56-d73a-42c8-a18b-2de68a860516	51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	Master in Public Administration	Mindanao State University	2004	2009	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0d902ab7-ba4b-4ee5-86ea-17dff8e22f72	0affd4fd-56f6-49dc-ab47-d191881ae9f6	Bachelor of Science in Education	University of the Philippines	2007	2011	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b4c7719f-9da8-4590-8b63-02c5cbea55de	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	Bachelor of Science in Education	University of Santo Tomas	2012	2013	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c353a057-8ab1-4f2e-8e7a-eb60cff507d0	afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	Bachelor of Arts in Psychology	Ateneo de Manila University	2017	2017	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
3925f346-20f2-474b-9088-412f8dda92db	d86db822-8838-417d-aa9f-a5de699ea7c9	Bachelor of Science in Information Technology	Mindanao State University	2010	2014	2026-05-21 19:31:42.769473	2026-05-21 19:31:42.769473
567c3fe0-a1de-4191-b46b-bfaed9fa6384	b708e15f-6869-4f21-b539-ccf6a2e9b49b	Bachelor of Science in Computer Science		\N	\N	2026-03-26 11:49:56.460318	2026-05-22 11:18:13.323529
18141862-11b4-482f-a91e-df35c4a7243c	b708e15f-6869-4f21-b539-ccf6a2e9b49b	Best Hacker of the Decade		\N	\N	2026-05-22 11:19:48.734169	2026-05-22 11:19:48.734169
\.


--
-- Data for Name: employee_references; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.employee_references (id, employee_id, name, address, contact_number, created_at, updated_at) FROM stdin;
9890bb7a-29a5-4634-ae1c-56bf7342dcbe	4b769217-7871-4b4d-96fb-e30eac1e381c	{"full_name": "Daniel Mendoza"}	{"city": "Cebu", "street": "58 Reference St"}	09733834530	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2a377167-b917-4c0c-8005-c1cd74b2c791	4b769217-7871-4b4d-96fb-e30eac1e381c	{"full_name": "Patricia Dela Cruz"}	{"city": "Iloilo", "street": "56 Reference Ave"}	09359117833	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
cb670f30-1eb6-4845-b2c1-c948ff696c70	09565e28-12a8-48b9-b85b-f96973ff77d7	{"full_name": "Patricia Valdez"}	{"city": "Cebu", "street": "29 Reference St"}	09894026125	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
52b150f5-312a-4e37-8ba0-1f603901b602	09565e28-12a8-48b9-b85b-f96973ff77d7	{"full_name": "Carlo Santos"}	{"city": "Baguio", "street": "127 Reference Ave"}	09551913930	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2df1b941-a77a-43c2-a987-26ca39d46cf2	d86db822-8838-417d-aa9f-a5de699ea7c9	{"full_name": "Lucas Valdez"}	{"city": "Manila", "street": "192 Reference St"}	09888543114	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2bbeff8c-f1ae-4b36-947f-740c54c70e1e	d86db822-8838-417d-aa9f-a5de699ea7c9	{"full_name": "Rica Reyes"}	{"city": "Iloilo", "street": "113 Reference Ave"}	09244238639	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a9ca124f-c036-4300-a2ae-cd4e3d1b4a52	04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	{"full_name": "Olivia Reyes"}	{"city": "Cebu", "street": "142 Reference St"}	09159328574	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c168a941-c081-48ae-8eb2-dda46d4bdf08	04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	{"full_name": "Kevin Reyes"}	{"city": "Iloilo", "street": "230 Reference Ave"}	09835932126	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e6e2a641-71ec-47f8-8f62-e6874f33a3d1	553785c4-605f-44c8-907e-99151018f079	{"full_name": "Daniel Aquino"}	{"city": "Davao", "street": "217 Reference St"}	09472338136	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6fa533b0-64bd-4fc7-8636-42832e869fdb	553785c4-605f-44c8-907e-99151018f079	{"full_name": "Sofia Navarro"}	{"city": "Quezon City", "street": "46 Reference Ave"}	09832447087	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a07c24bd-a681-4028-bd21-8edf7932f4a1	4ac742ce-72ee-426b-94c1-036739890960	{"full_name": "Juan Villanueva"}	{"city": "Manila", "street": "87 Reference St"}	09709358340	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9d01ac4c-c23f-4cf6-81da-99f7df9868fa	4ac742ce-72ee-426b-94c1-036739890960	{"full_name": "Chloe Pineda"}	{"city": "Baguio", "street": "131 Reference Ave"}	09563544242	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f5b40415-49f8-4e5b-a91a-cd022da4ba2f	fda81a86-ed25-4ba4-b9af-a0195f24794d	{"full_name": "Chloe Santos"}	{"city": "Cebu", "street": "222 Reference St"}	09864274270	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
deb2ef20-25af-48a0-8b4e-9e94ace50ffc	fda81a86-ed25-4ba4-b9af-a0195f24794d	{"full_name": "Jose Ramos"}	{"city": "Quezon City", "street": "144 Reference Ave"}	09245353805	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
61c23a0e-39a5-4799-b7c4-696506067ac2	807ce8f3-7088-4ebe-9507-d18fd626d08e	{"full_name": "Rica Aquino"}	{"city": "Davao", "street": "193 Reference St"}	09818985913	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d57089ff-9339-4e0f-9bca-aa5803cd2f24	807ce8f3-7088-4ebe-9507-d18fd626d08e	{"full_name": "Rica Navarro"}	{"city": "Quezon City", "street": "23 Reference Ave"}	09966495500	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
43bb55ba-1438-48af-ac79-6d33924a36c5	bd0906b1-ca13-45ed-9638-d1297099fa8b	{"full_name": "Paolo Salazar"}	{"city": "Davao", "street": "144 Reference St"}	09201708240	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c614f152-9436-4404-97ac-b70bcb240c2a	bd0906b1-ca13-45ed-9638-d1297099fa8b	{"full_name": "Noah Reyes"}	{"city": "Quezon City", "street": "223 Reference Ave"}	09747091991	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
04279441-178a-43e4-bb6d-12eb2bf78c1f	15fcb03c-8d71-4634-8642-d30767d02ea4	{"full_name": "Lucas Aquino"}	{"city": "Davao", "street": "210 Reference St"}	09827897825	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8c9fa026-d411-4b28-86e0-f8d9c72e122a	15fcb03c-8d71-4634-8642-d30767d02ea4	{"full_name": "Patricia Santos"}	{"city": "Iloilo", "street": "50 Reference Ave"}	09478343125	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8c5fb099-6a30-4813-a253-1bdaa69f5f55	4de74611-4e36-4b4d-becc-672303b61eca	{"full_name": "Noah Castro"}	{"city": "Cebu", "street": "206 Reference St"}	09211554497	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
bef676ed-9001-4a45-8a5e-756f7174f7af	4de74611-4e36-4b4d-becc-672303b61eca	{"full_name": "Carlo Castro"}	{"city": "Baguio", "street": "214 Reference Ave"}	09112001360	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8cb86c99-c121-4c5c-b3ec-52641b537387	05ab41f7-955f-4594-8838-bf228269e2e7	{"full_name": "Daniel Santos"}	{"city": "Manila", "street": "141 Reference St"}	09424263459	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
88370ca8-4d15-4f41-8e7d-d9518354025f	05ab41f7-955f-4594-8838-bf228269e2e7	{"full_name": "Ana Castro"}	{"city": "Iloilo", "street": "77 Reference Ave"}	09466522589	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0a134fae-7a10-4b69-b51a-bd8ef5ebef21	243d02a5-8b94-49ba-9be1-ee2391df997d	{"full_name": "Chloe Castro"}	{"city": "Cebu", "street": "108 Reference St"}	09444658122	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
44c5b21c-66b2-4791-bd15-232857365cf7	243d02a5-8b94-49ba-9be1-ee2391df997d	{"full_name": "Noah Dela Cruz"}	{"city": "Iloilo", "street": "225 Reference Ave"}	09705188600	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
fbc4a30e-3e38-4210-aad4-06222ca4c3e3	a9655e0e-c848-4019-9cb8-4a4800fae8f1	{"full_name": "Liam Garcia"}	{"city": "Manila", "street": "199 Reference St"}	09293482614	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
15c1955b-1707-467c-9bc7-34bbe19232d0	a9655e0e-c848-4019-9cb8-4a4800fae8f1	{"full_name": "Emma Mercado"}	{"city": "Quezon City", "street": "234 Reference Ave"}	09824808194	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ea898850-91ff-4665-b2d0-708099049eaf	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	{"full_name": "Kevin Mercado"}	{"city": "Davao", "street": "36 Reference St"}	09838943416	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
09cbb15f-9b2a-440b-bc0e-8878b58f6123	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	{"full_name": "Chloe Reyes"}	{"city": "Iloilo", "street": "139 Reference Ave"}	09144384081	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
78b7f797-a831-4121-8944-ced1199f6a45	8503751d-84d4-4f15-be01-7b694fb99e03	{"full_name": "Paolo Santos"}	{"city": "Manila", "street": "141 Reference St"}	09383059353	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f184008e-9c83-47e4-a2c2-1bc2ea030f99	8503751d-84d4-4f15-be01-7b694fb99e03	{"full_name": "Rica Navarro"}	{"city": "Quezon City", "street": "160 Reference Ave"}	09368039966	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e8374311-7646-4bf2-8614-d756f46f9bf1	5883754f-2fc6-4bbe-b32e-763336b0b9bb	{"full_name": "Noah Domingo"}	{"city": "Cebu", "street": "54 Reference St"}	09117228453	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f86fe133-e95a-499a-9d55-be24fd7d74d6	5883754f-2fc6-4bbe-b32e-763336b0b9bb	{"full_name": "Bea Reyes"}	{"city": "Quezon City", "street": "196 Reference Ave"}	09752139086	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2fe53ca2-54ea-414a-8fe9-f860875ff50b	4f2b038b-c39c-419f-8dc4-573312dfc81c	{"full_name": "Juan Bautista"}	{"city": "Cebu", "street": "77 Reference St"}	09606932726	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1842368f-767a-4700-b8b0-103b5e3acde8	4f2b038b-c39c-419f-8dc4-573312dfc81c	{"full_name": "Paolo Mercado"}	{"city": "Quezon City", "street": "135 Reference Ave"}	09614654916	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7c3354d2-7d7e-45cf-b0fe-a888b632dd59	5736e0e2-3c76-47e3-bc85-7362a0ba0810	{"full_name": "Sofia Salazar"}	{"city": "Manila", "street": "177 Reference St"}	09734841549	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d9614388-137e-49d2-8411-cda7f3939bc3	5736e0e2-3c76-47e3-bc85-7362a0ba0810	{"full_name": "Sofia Dela Cruz"}	{"city": "Iloilo", "street": "129 Reference Ave"}	09866912945	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
85349bf3-7b67-4a32-942b-a2b99d3160e6	4e8191e5-1681-492c-8b1e-e009a8c542d1	{"full_name": "Emma Ramos"}	{"city": "Manila", "street": "220 Reference St"}	09265403966	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0e48a7a2-92b8-4d57-bcca-1136847660f0	4e8191e5-1681-492c-8b1e-e009a8c542d1	{"full_name": "Carlo Villanueva"}	{"city": "Iloilo", "street": "207 Reference Ave"}	09794403951	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
3f0bccea-0eae-4628-a736-078069d7073a	970c4aaf-e18c-4a44-98eb-6e1b363cdce1	{"full_name": "Liam Garcia"}	{"city": "Cebu", "street": "210 Reference St"}	09849073562	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
719533c8-3e04-49ff-85c5-cedf7995d5db	970c4aaf-e18c-4a44-98eb-6e1b363cdce1	{"full_name": "Ethan Santos"}	{"city": "Quezon City", "street": "101 Reference Ave"}	09629271765	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f6e79d0e-ed73-4109-a76a-88d20dc3d452	6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	{"full_name": "Carlo Santos"}	{"city": "Cebu", "street": "234 Reference St"}	09934577558	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1528637a-d1b9-4068-8c11-f37721f5daab	6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	{"full_name": "Ava Reyes"}	{"city": "Iloilo", "street": "241 Reference Ave"}	09242121812	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b4c547de-0ce2-44ff-9919-e384fbeabbd3	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	{"full_name": "Juan Valdez"}	{"city": "Manila", "street": "43 Reference St"}	09672163884	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ca6b5b03-ffb5-4005-b104-b4fcb22f5b64	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	{"full_name": "Ana Valdez"}	{"city": "Baguio", "street": "127 Reference Ave"}	09563699673	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
25644985-380c-464d-b507-ad5a0e4c8e1d	a4f6e888-4d7a-4d44-8e37-a7813d848321	{"full_name": "Kevin Villanueva"}	{"city": "Cebu", "street": "129 Reference St"}	09869311410	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ae6f1109-e29f-4229-b913-35123aee90fe	a4f6e888-4d7a-4d44-8e37-a7813d848321	{"full_name": "Patricia Flores"}	{"city": "Quezon City", "street": "50 Reference Ave"}	09856108384	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
93fb27a4-714d-4eef-b3e2-874037c38a41	b843a2fa-6035-4f64-998a-59ede57b3a5a	{"full_name": "Angela Pineda"}	{"city": "Manila", "street": "174 Reference St"}	09784102416	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7c3ffe86-a638-46ba-9583-9228cda5975c	b843a2fa-6035-4f64-998a-59ede57b3a5a	{"full_name": "Carlo Pineda"}	{"city": "Quezon City", "street": "49 Reference Ave"}	09373097282	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5d0ec4f5-7fa1-4c95-ab9e-411a693153b3	8d804703-fe50-4766-8ec9-d792c53b4d7f	{"full_name": "Jasmine Mendoza"}	{"city": "Davao", "street": "212 Reference St"}	09632702348	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7e7f216f-3a9b-4350-8dfd-bb41aaaa752f	8d804703-fe50-4766-8ec9-d792c53b4d7f	{"full_name": "Rica Domingo"}	{"city": "Iloilo", "street": "63 Reference Ave"}	09593487190	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5cad9cf1-8369-449c-9535-a752b2d2f13f	51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	{"full_name": "Jose Torres"}	{"city": "Davao", "street": "133 Reference St"}	09107463259	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
35c09f9f-a6d9-4df4-8eaf-dd9a2c456079	51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	{"full_name": "Liam Villanueva"}	{"city": "Iloilo", "street": "55 Reference Ave"}	09952012903	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f1028ff8-5ec2-4023-8de4-685e8f83982c	0affd4fd-56f6-49dc-ab47-d191881ae9f6	{"full_name": "Angela Pineda"}	{"city": "Cebu", "street": "184 Reference St"}	09627678440	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7756038c-b2f1-4645-845e-9c269934a576	0affd4fd-56f6-49dc-ab47-d191881ae9f6	{"full_name": "Miguel Mendoza"}	{"city": "Quezon City", "street": "245 Reference Ave"}	09215976097	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1ae49e6b-4b9c-4168-b4ce-9143914c5b71	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	{"full_name": "Chloe Garcia"}	{"city": "Manila", "street": "197 Reference St"}	09785267743	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8781cd8c-b890-4b1f-8912-c44cb87d8abf	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	{"full_name": "Emma Salazar"}	{"city": "Quezon City", "street": "116 Reference Ave"}	09281636878	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
dff27b41-5fa4-4c41-8272-b443bafb76ab	afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	{"full_name": "Lucas Santos"}	{"city": "Manila", "street": "135 Reference St"}	09913398572	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f4839aba-18d9-44d4-a785-b3113e36cde4	afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	{"full_name": "Ethan Torres"}	{"city": "Quezon City", "street": "210 Reference Ave"}	09282705757	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.employees (id, employee_no, employment_type, status, created_at, updated_at, photo_url, user_id) FROM stdin;
04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	EMP-2026-0004	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
553785c4-605f-44c8-907e-99151018f079	EMP-2026-0005	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
fda81a86-ed25-4ba4-b9af-a0195f24794d	EMP-2026-0007	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
bd0906b1-ca13-45ed-9638-d1297099fa8b	EMP-2026-0009	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
4de74611-4e36-4b4d-becc-672303b61eca	EMP-2026-0011	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
243d02a5-8b94-49ba-9be1-ee2391df997d	EMP-2026-0013	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
8503751d-84d4-4f15-be01-7b694fb99e03	EMP-2026-0016	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
4f2b038b-c39c-419f-8dc4-573312dfc81c	EMP-2026-0018	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
4e8191e5-1681-492c-8b1e-e009a8c542d1	EMP-2026-0020	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
b843a2fa-6035-4f64-998a-59ede57b3a5a	EMP-2026-0025	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	EMP-2026-0027	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
0affd4fd-56f6-49dc-ab47-d191881ae9f6	EMP-2026-0028	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
7ac3efa3-a8dc-4b08-9116-6287a9de2b86	EMP-2026-0029	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
4b769217-7871-4b4d-96fb-e30eac1e381c	EMP-2026-0001	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	48ac2e1c-03b2-4a08-8d33-d28bf65bbc1e
a6c8f376-a599-41a3-afe4-399385c2ed17	123	TEACHING	DRAFT	2026-04-08 20:37:23.666754	2026-04-08 20:37:23.666754	\N	\N
09565e28-12a8-48b9-b85b-f96973ff77d7	EMP-2026-0002	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/12bcc41f-a44f-4b36-84b2-5f625a984112.webp	\N
afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	EMP-2026-0030	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
a24f57b7-fbbb-4bff-844f-4c32091e88ea	s	TEACHING	DRAFT	2026-05-10 00:23:50.03052	2026-05-10 00:23:50.03052	\N	\N
5883754f-2fc6-4bbe-b32e-763336b0b9bb	EMP-2026-0017	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
5736e0e2-3c76-47e3-bc85-7362a0ba0810	EMP-2026-0019	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
a9655e0e-c848-4019-9cb8-4a4800fae8f1	EMP-2026-0014	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/ecb47f03-b983-473b-a45f-9ac85b1b2f35.webp	\N
1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	EMP-2026-0023	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	EMP-2026-0022	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
807ce8f3-7088-4ebe-9507-d18fd626d08e	EMP-2026-0008	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/7f533ec1-6195-4539-ba0e-3c2a10aec128.webp	\N
970c4aaf-e18c-4a44-98eb-6e1b363cdce1	EMP-2026-0021	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/58010069-23f7-40d9-a4c7-0821a34f5610.webp	\N
8d804703-fe50-4766-8ec9-d792c53b4d7f	EMP-2026-0026	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/ce341430-dc01-4e5b-883f-6d2880b2a06d.webp	\N
4ac742ce-72ee-426b-94c1-036739890960	EMP-2026-0006	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/5f6a8679-afb4-46ac-bd64-34b9a18e8196.webp	\N
ea9b230e-e62d-46ec-a361-0d671a7d3ac3	EMP-2026-0015	NON_TEACHING	ARCHIVED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N	\N
a4f6e888-4d7a-4d44-8e37-a7813d848321	EMP-2026-0024	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/cf403561-bacc-4a5a-9e61-2b71e0a36247.webp	\N
b708e15f-6869-4f21-b539-ccf6a2e9b49b	EMP-0031	TEACHING	SUBMITTED	2026-03-26 11:48:24.894823	2026-03-26 11:48:24.894823	/uploads/profile/6d2859a5-54bd-4c23-95bb-5ddada81a3be.webp	\N
15fcb03c-8d71-4634-8642-d30767d02ea4	EMP-2026-0010	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/469e577e-1509-4cea-8429-99c1ee8b5505.webp	\N
d86db822-8838-417d-aa9f-a5de699ea7c9	EMP-2026-0003	NON_TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/76943a2a-b6fc-4707-99e5-29cd7dbc8fe7.webp	\N
05ab41f7-955f-4594-8838-bf228269e2e7	EMP-2026-0012	TEACHING	SUBMITTED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	/uploads/profile/fa4b8f03-73e7-462a-a2df-a6758e06a6af.webp	\N
\.


--
-- Data for Name: employment_data; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.employment_data (employee_id, date_hired, position_id, designation_id, sss, pagibig, tax, philhealth, peraa, employment_status, employment_basis, official_working_hours, other_employment, other_employment_working_hours, created_at, updated_at, salary) FROM stdin;
4b769217-7871-4b4d-96fb-e30eac1e381c	2020-10-30	1	2	SSS-36513679	PAG-69979887	TIN-935174231	PH-20147755	PERAA-8808	CONTRACTUAL	FULL_TIME	48	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	2014-09-05	1	4	SSS-16033252	PAG-81286206	TIN-827664217	PH-12129899	PERAA-3946	RESIGNED	PART_TIME	48	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
553785c4-605f-44c8-907e-99151018f079	2017-03-01	1	4	SSS-82348341	PAG-63841585	TIN-463578925	PH-25054647	PERAA-8503	RESIGNED	FULL_TIME	40	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
4ac742ce-72ee-426b-94c1-036739890960	2019-12-25	5	4	SSS-84049925	PAG-55805151	TIN-168763284	PH-75403673	PERAA-1931	REGULAR	FULL_TIME	20	Consultancy	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
bd0906b1-ca13-45ed-9638-d1297099fa8b	2018-10-31	1	3	SSS-48794054	PAG-78256867	TIN-967732419	PH-13249809	PERAA-8340	RESIGNED	PART_TIME	40	Consultancy	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
4de74611-4e36-4b4d-becc-672303b61eca	2017-05-08	7	1	SSS-44712704	PAG-67288946	TIN-323015272	PH-22169158	PERAA-7529	REGULAR	FULL_TIME	30	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
243d02a5-8b94-49ba-9be1-ee2391df997d	2021-07-10	7	3	SSS-95073036	PAG-81320599	TIN-636121401	PH-24178516	PERAA-9348	RESIGNED	FULL_TIME	40	Consultancy	6	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
ea9b230e-e62d-46ec-a361-0d671a7d3ac3	2014-02-26	4	1	SSS-20300670	PAG-89232185	TIN-103268002	PH-40253437	PERAA-1591	RESIGNED	FULL_TIME	40	Consultancy	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
8503751d-84d4-4f15-be01-7b694fb99e03	2017-11-20	3	1	SSS-52958588	PAG-95089526	TIN-447917476	PH-92130682	PERAA-9803	RESIGNED	FULL_TIME	20	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
4f2b038b-c39c-419f-8dc4-573312dfc81c	2019-06-15	2	1	SSS-42676034	PAG-21576247	TIN-171113558	PH-66316288	PERAA-1817	RESIGNED	PART_TIME	40	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
4e8191e5-1681-492c-8b1e-e009a8c542d1	2017-07-16	2	2	SSS-38248408	PAG-25811859	TIN-194801111	PH-34492145	PERAA-6163	CONTRACTUAL	FULL_TIME	48	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
970c4aaf-e18c-4a44-98eb-6e1b363cdce1	2020-11-11	7	2	SSS-81049704	PAG-11714893	TIN-790214245	PH-60651954	PERAA-7121	REGULAR	FULL_TIME	40	Consultancy	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
b843a2fa-6035-4f64-998a-59ede57b3a5a	2017-06-24	6	4	SSS-17851772	PAG-94274193	TIN-132901149	PH-99724312	PERAA-5165	REGULAR	PART_TIME	40	Consultancy	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
8d804703-fe50-4766-8ec9-d792c53b4d7f	2022-10-23	6	2	SSS-85330989	PAG-67244145	TIN-483965955	PH-31703876	PERAA-3828	REGULAR	FULL_TIME	40	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	2020-08-27	5	3	SSS-48707704	PAG-42157107	TIN-243696034	PH-79264418	PERAA-2005	REGULAR	FULL_TIME	30	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
0affd4fd-56f6-49dc-ab47-d191881ae9f6	2014-11-06	2	2	SSS-30354243	PAG-31532949	TIN-591644788	PH-61377414	PERAA-9800	RESIGNED	FULL_TIME	48	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
7ac3efa3-a8dc-4b08-9116-6287a9de2b86	2015-05-23	4	3	SSS-34190885	PAG-55011055	TIN-376471863	PH-23849199	PERAA-9836	CONTRACTUAL	PART_TIME	40	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626	\N
1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	2025-11-29	5	3	SSS-42766677	PAG-45132772	TIN-437405519	PH-26256365	PERAA-9903	PROBATIONARY	PART_TIME	30		\N	2026-03-26 03:24:30.523626	2026-05-25 03:13:15.234381	\N
15fcb03c-8d71-4634-8642-d30767d02ea4	2023-06-02	4	4	SSS-32923538	PAG-45870884	TIN-637857767	PH-16415006	PERAA-1115	PROBATIONARY	PART_TIME	48		6	2026-03-26 03:24:30.523626	2026-05-25 03:05:16.094189	\N
6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	2023-10-28	2	4	SSS-78438630	PAG-97478131	TIN-699115324	PH-56535219	PERAA-8428	RESIGNED	PART_TIME	20		8	2026-03-26 03:24:30.523626	2026-05-25 03:13:46.82378	\N
09565e28-12a8-48b9-b85b-f96973ff77d7	2020-06-04	1	3	SSS-33030871	PAG-14938729	TIN-893441487	PH-50682808	PERAA-9210	REGULAR	FULL_TIME	30		\N	2026-03-26 03:24:30.523626	2026-05-25 03:07:21.572569	\N
a9655e0e-c848-4019-9cb8-4a4800fae8f1	2023-05-27	4	1	SSS-58270918	PAG-61890564	TIN-573352771	PH-80249798	PERAA-3535	REGULAR	FULL_TIME	40	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 13:46:58.389067	\N
fda81a86-ed25-4ba4-b9af-a0195f24794d	2015-01-17	3	3	SSS-16487657	PAG-30339133	TIN-427891411	PH-63885503	PERAA-6767	REGULAR	PART_TIME	30	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 14:07:47.895966	\N
807ce8f3-7088-4ebe-9507-d18fd626d08e	2021-07-01	1	3	SSS-35222804	PAG-42436571	TIN-792859528	PH-46522502	PERAA-1204	PROBATIONARY	FULL_TIME	40	\N	\N	2026-03-26 03:24:30.523626	2026-03-26 14:17:32.101975	\N
afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	2020-05-30	1	2	SSS-25665852	PAG-53116102	TIN-178519386	PH-54589299	PERAA-6616	PROBATIONARY	FULL_TIME	48	Consultancy	2	2026-03-26 03:24:30.523626	2026-05-25 03:10:50.597548	\N
a24f57b7-fbbb-4bff-844f-4c32091e88ea	2026-05-07	5	\N						REGULAR	FULL_TIME	\N		\N	2026-05-10 00:24:00.603891	2026-05-10 00:24:00.603891	\N
5883754f-2fc6-4bbe-b32e-763336b0b9bb	2023-05-30	1	2	SSS-72185222	PAG-14757249	TIN-170215477	PH-69162275	PERAA-9322	PROBATIONARY	FULL_TIME	40	Consultancy	12	2026-03-26 03:24:30.523626	2026-05-25 03:12:05.986415	\N
b708e15f-6869-4f21-b539-ccf6a2e9b49b	2020-05-30	3	1						REGULAR	FULL_TIME	\N		\N	2026-03-26 11:49:41.646176	2026-05-25 02:10:00.364831	15000.00
d86db822-8838-417d-aa9f-a5de699ea7c9	2023-10-12	5	3	SSS-67664483	PAG-32310981	TIN-834199710	PH-11471394	PERAA-7178	REGULAR	FULL_TIME	40		\N	2026-03-26 03:24:30.523626	2026-05-25 02:12:43.545592	10543.00
05ab41f7-955f-4594-8838-bf228269e2e7	2020-05-29	3	1	SSS-68031174	PAG-23161414	TIN-113519139	PH-92533114	PERAA-5880	RESIGNED	FULL_TIME	40		\N	2026-03-26 03:24:30.523626	2026-05-25 02:13:12.415894	\N
a4f6e888-4d7a-4d44-8e37-a7813d848321	2026-05-24	6	4	SSS-55412931	PAG-97776196	TIN-847472715	PH-56278551	PERAA-2306	PROBATIONARY	PART_TIME	30		\N	2026-03-26 03:24:30.523626	2026-05-25 04:11:25.003639	\N
5736e0e2-3c76-47e3-bc85-7362a0ba0810	2025-12-10	6	2	SSS-75025226	PAG-95593304	TIN-494830418	PH-10828711	PERAA-3618	PROBATIONARY	FULL_TIME	20	Consultancy	4	2026-03-26 03:24:30.523626	2026-05-25 03:12:42.415185	\N
\.


--
-- Data for Name: employment_history; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.employment_history (id, employee_id, start_date, end_date, "position", employer, salary, reason_for_leaving, created_at, updated_at) FROM stdin;
0fcafe6f-df17-4b96-a92b-5b8938cbc79c	4b769217-7871-4b4d-96fb-e30eac1e381c	2015-04-11	2019-02-03	Coordinator	ABC College	35088.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ebcf5931-8a56-4931-a8eb-6c3e8f6cf823	09565e28-12a8-48b9-b85b-f96973ff77d7	2010-03-18	2017-03-12	Analyst	Private Corp	31367.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
df3ea53a-73c9-4ec3-887d-4a26113c1892	d86db822-8838-417d-aa9f-a5de699ea7c9	2008-06-07	2021-08-05	Coordinator	City Hall	21529.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
261da6cd-54b5-4460-89d5-85e51595f1f1	04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	2011-11-20	2021-08-15	Coordinator	City Hall	21900.00	End of Contract	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c909427d-0aa6-441a-93fe-7dcb73b6327b	553785c4-605f-44c8-907e-99151018f079	2009-12-18	2021-11-22	Staff	Private Corp	29703.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d7e38e26-dbdb-45ed-b158-a01fdc9e519a	4ac742ce-72ee-426b-94c1-036739890960	2011-11-23	2021-01-08	Instructor	Private Corp	23702.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1286eb10-6724-40f8-b398-86e2d137480c	fda81a86-ed25-4ba4-b9af-a0195f24794d	2015-10-31	2021-12-13	Coordinator	ABC College	28988.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
45552329-f55e-423d-9f0c-654e1b9625aa	807ce8f3-7088-4ebe-9507-d18fd626d08e	2011-03-18	2019-12-17	Instructor	Private Corp	23080.00	End of Contract	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
60521a0f-6e8d-4eaa-9dcb-2eba383245fd	bd0906b1-ca13-45ed-9638-d1297099fa8b	2008-02-01	2020-11-14	Analyst	Private Corp	37474.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ae5c3ab0-1fa1-4b00-8737-99e63efb2a2f	15fcb03c-8d71-4634-8642-d30767d02ea4	2008-08-24	2018-11-23	Instructor	Private Corp	38184.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e360ed17-781b-4821-803f-cef35c2d68f8	4de74611-4e36-4b4d-becc-672303b61eca	2010-04-04	2018-10-03	Coordinator	Private Corp	35716.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4ef61093-0790-4ecc-a302-66672d810e9d	05ab41f7-955f-4594-8838-bf228269e2e7	2008-04-08	2019-08-10	Staff	Private Corp	29685.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b221697f-4036-4028-8a7e-9838bbe337fd	243d02a5-8b94-49ba-9be1-ee2391df997d	2014-12-26	2021-09-11	Staff	City Hall	23203.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4983f76d-c810-4f15-9ec3-f8850e938655	a9655e0e-c848-4019-9cb8-4a4800fae8f1	2009-12-20	2020-10-07	Instructor	Private Corp	31001.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a6af14ff-5e69-4c67-8163-5755172c5ee6	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	2013-01-01	2019-07-28	Instructor	ABC College	29515.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
cbfc7147-9089-4dff-a0b8-926b8020f13b	8503751d-84d4-4f15-be01-7b694fb99e03	2015-02-20	2018-06-27	Instructor	ABC College	23326.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
57834a9d-ee47-4992-b073-99841dd494b2	5883754f-2fc6-4bbe-b32e-763336b0b9bb	2008-11-29	2018-06-30	Analyst	City Hall	22254.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
20f3d168-93c1-4670-9aa7-f886480c7443	4f2b038b-c39c-419f-8dc4-573312dfc81c	2013-12-12	2019-07-23	Instructor	Private Corp	33686.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6e0a3e50-2933-4c11-83a1-724f4b76b956	5736e0e2-3c76-47e3-bc85-7362a0ba0810	2016-03-11	2021-07-04	Coordinator	City Hall	23861.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
fe59d47e-5ad7-450e-bcf3-74a66c4975bc	4e8191e5-1681-492c-8b1e-e009a8c542d1	2010-12-30	2017-06-22	Coordinator	Public School	30454.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e29527f5-df86-4644-858e-8bbd2ae75a13	970c4aaf-e18c-4a44-98eb-6e1b363cdce1	2014-09-06	2019-11-07	Coordinator	Private Corp	23835.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
08d3c2be-3686-4c9c-9bff-eb8c52379053	6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	2011-04-11	2019-09-26	Analyst	ABC College	18641.00	End of Contract	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2d0be733-0751-4daf-873a-d7060313765b	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	2009-10-21	2020-08-04	Instructor	Public School	44986.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
64d2b94e-81bd-4b47-a7a5-bb53c21e615a	a4f6e888-4d7a-4d44-8e37-a7813d848321	2013-02-27	2017-06-19	Staff	City Hall	43800.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2d68c510-5955-4f4e-9f94-3148a31831a7	b843a2fa-6035-4f64-998a-59ede57b3a5a	2012-12-23	2021-05-10	Coordinator	Private Corp	18739.00	Relocation	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
abfa6382-6ce6-487d-bca3-de6ab6fd080a	8d804703-fe50-4766-8ec9-d792c53b4d7f	2013-11-12	2019-06-05	Analyst	Public School	38752.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9d73421d-c612-4c82-b0a6-bf08d4b10acb	51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	2010-07-03	2017-02-18	Staff	Public School	37029.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7aa83d4a-3594-4407-a3b9-85ac64f55ac1	0affd4fd-56f6-49dc-ab47-d191881ae9f6	2008-08-20	2017-05-02	Instructor	City Hall	24068.00	End of Contract	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
147676a6-89bd-4639-bec5-6c1f425628d1	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	2012-09-01	2020-10-30	Analyst	City Hall	35454.00	End of Contract	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
77410764-2bab-4b9c-a16a-55aed1df4938	afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	2014-06-07	2020-05-31	Coordinator	Private Corp	24132.00	Career Growth	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ccebbcbc-988c-4322-8d05-e4cacc953125	b708e15f-6869-4f21-b539-ccf6a2e9b49b	2026-04-23	\N	Deans	MC	\N		2026-04-30 23:30:09.135706	2026-04-30 23:30:09.135706
\.


--
-- Data for Name: examinations_taken; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.examinations_taken (id, employee_id, title, date_taken, rating, created_at, updated_at) FROM stdin;
04369443-ea52-4d6d-bb61-52e30a2b8827	4b769217-7871-4b4d-96fb-e30eac1e381c	Licensure Examination	2023-07-28	94%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
3324aba4-9647-4a95-a8a7-c74ff710ef13	09565e28-12a8-48b9-b85b-f96973ff77d7	Civil Service Professional	2018-12-26	96%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
64899fca-8ea9-4872-a90d-16a1127083e7	d86db822-8838-417d-aa9f-a5de699ea7c9	Licensure Examination	2013-08-08	86%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4b6fe284-f976-4d91-82ee-b762458b43dc	04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	Eligibility Exam	2023-06-09	76%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2345270f-fc0f-4cb7-8ffb-55ab5c3f7ab2	553785c4-605f-44c8-907e-99151018f079	Licensure Examination	2024-12-19	97%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
86e25268-693d-4c22-8177-3620ad3baa95	4ac742ce-72ee-426b-94c1-036739890960	Eligibility Exam	2013-01-07	86%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e2636048-040e-49c5-a9a3-a32c1f19d415	fda81a86-ed25-4ba4-b9af-a0195f24794d	Civil Service Professional	2022-07-10	86%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
3e6e0aa8-e551-4d9f-82e4-93c5b8741269	807ce8f3-7088-4ebe-9507-d18fd626d08e	Civil Service Professional	2017-02-09	91%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
c69a7afe-5adb-43e8-b353-42443c8041b3	bd0906b1-ca13-45ed-9638-d1297099fa8b	Civil Service Professional	2016-08-05	81%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
17ed3702-7544-4de1-bfb0-d9ef53094af2	15fcb03c-8d71-4634-8642-d30767d02ea4	Eligibility Exam	2011-03-23	87%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
47ffefb6-2fce-4111-b5e7-c29571b4d376	4de74611-4e36-4b4d-becc-672303b61eca	Eligibility Exam	2014-10-16	81%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
511f19de-01e8-4ee4-99be-acf1ec1544d3	05ab41f7-955f-4594-8838-bf228269e2e7	Licensure Examination	2025-07-11	93%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
46c16af6-df1f-43b0-9dd0-db3f083616db	243d02a5-8b94-49ba-9be1-ee2391df997d	Licensure Examination	2022-09-26	78%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ec215286-11e3-46ff-9f03-e39c9e2fba9b	a9655e0e-c848-4019-9cb8-4a4800fae8f1	Licensure Examination	2018-06-13	76%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ad4ea890-ca5b-43d5-ac79-14b9a9167679	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	Eligibility Exam	2023-05-10	83%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6a94129a-569e-40ac-920e-3986ad8fd9a6	8503751d-84d4-4f15-be01-7b694fb99e03	Civil Service Professional	2024-01-05	79%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
601c75c8-356c-41fa-9102-ea41a91be1e8	5883754f-2fc6-4bbe-b32e-763336b0b9bb	Eligibility Exam	2014-10-06	90%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
871e6851-4927-4162-ba42-524f09d42d5e	4f2b038b-c39c-419f-8dc4-573312dfc81c	Eligibility Exam	2010-05-26	86%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7bc98f63-e1a5-4db8-aa53-428e0e5978b5	5736e0e2-3c76-47e3-bc85-7362a0ba0810	Civil Service Professional	2011-11-02	80%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
07859a45-6c36-41d3-a94c-3a20e05e49b5	4e8191e5-1681-492c-8b1e-e009a8c542d1	Eligibility Exam	2023-09-05	75%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0c6c5690-e0e5-4747-89ef-b4969923b676	970c4aaf-e18c-4a44-98eb-6e1b363cdce1	Eligibility Exam	2023-01-24	87%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
540857ce-04e3-43f9-b2b9-455630daee95	6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	Civil Service Professional	2018-04-04	98%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
84ee8e4d-887f-4057-b95d-6254fb8e8e2a	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	Eligibility Exam	2022-09-02	94%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6375cff8-e267-4547-b75e-ce57bf1fe0b1	a4f6e888-4d7a-4d44-8e37-a7813d848321	Civil Service Professional	2016-07-25	89%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
3282e839-2d9a-4234-820e-863690c3e5ba	b843a2fa-6035-4f64-998a-59ede57b3a5a	Licensure Examination	2024-05-03	77%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
95ab29b4-ac79-42f2-a395-12188ae0eeb9	8d804703-fe50-4766-8ec9-d792c53b4d7f	Eligibility Exam	2022-01-15	81%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
81801347-4098-4eef-a044-f951e2c68fca	51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	Eligibility Exam	2025-04-29	81%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a5e00c6d-acff-4b99-905f-0332f81a7eeb	0affd4fd-56f6-49dc-ab47-d191881ae9f6	Licensure Examination	2019-10-08	93%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1be28c06-1275-4500-b751-0619831c1231	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	Licensure Examination	2023-12-09	93%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5cc7c4ac-1519-463c-8174-af80cea474fc	afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	Civil Service Professional	2021-12-16	95%	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: faculties; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.faculties (id, employee_id, department_id, teaching_load, created_at, updated_at) FROM stdin;
92aed001-efa8-4169-a9cb-44d7cb0c8184	15fcb03c-8d71-4634-8642-d30767d02ea4	3	340-LEC, 340-RLE GEN, 350-RLE COMM	2026-05-21 15:23:24.32455	2026-05-21 19:56:44.982519
b341f87e-1eab-4e7d-820d-5e205016f995	b708e15f-6869-4f21-b539-ccf6a2e9b49b	3	3	2026-05-21 20:09:54.679058	2026-05-21 20:09:54.679058
f2e467f8-a98d-42c6-a951-ee9990b09f60	d86db822-8838-417d-aa9f-a5de699ea7c9	3	340-LEC, 340-RLE GEN, 350-RLE COMM	2026-05-21 17:35:50.862322	2026-05-22 02:35:18.120367
888104f1-f367-4808-8179-3f7d9c59c48f	a4f6e888-4d7a-4d44-8e37-a7813d848321	2	Math, Science, JAVA	2026-05-21 15:15:37.113877	2026-05-22 02:47:04.013168
c22ec542-8bed-4ecb-bb4a-d57f4c477cb9	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	3	\N	2026-05-22 02:59:15.983388	2026-05-22 03:02:14.43023
565ea4be-7da7-4bb9-a84a-30d193d05fa1	b708e15f-6869-4f21-b539-ccf6a2e9b49b	2	JAVA	2026-05-22 03:09:19.261084	2026-05-22 03:09:19.261084
\.


--
-- Data for Name: family_background; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.family_background (employee_id, spouse, spouse_occupation, nearest_kin_name, nearest_kin_address, nearest_kin_contact_number, created_at, updated_at) FROM stdin;
4b769217-7871-4b4d-96fb-e30eac1e381c	\N	Teacher	{"full_name": "Daniel Mendoza"}	{"city": "Manila", "street": "197 Kin St", "province": "Cebu"}	09237912413	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
09565e28-12a8-48b9-b85b-f96973ff77d7	{"full_name": "Olivia Dela Cruz"}	\N	{"full_name": "Lucas Aquino"}	{"city": "Davao", "street": "134 Kin St", "province": "Metro Manila"}	09906931934	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d86db822-8838-417d-aa9f-a5de699ea7c9	{"full_name": "Maria Domingo"}	\N	{"full_name": "Mark Santos"}	{"city": "Manila", "street": "88 Kin St", "province": "Cebu"}	09373611713	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	\N	\N	{"full_name": "Jasmine Aquino"}	{"city": "Davao", "street": "45 Kin St", "province": "Davao del Sur"}	09948287502	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
553785c4-605f-44c8-907e-99151018f079	\N	\N	{"full_name": "Bea Garcia"}	{"city": "Davao", "street": "187 Kin St", "province": "Cebu"}	09315467150	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4ac742ce-72ee-426b-94c1-036739890960	\N	\N	{"full_name": "Rica Pineda"}	{"city": "Cebu", "street": "62 Kin St", "province": "Davao del Sur"}	09879107231	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
fda81a86-ed25-4ba4-b9af-a0195f24794d	\N	Teacher	{"full_name": "Chloe Mendoza"}	{"city": "Manila", "street": "171 Kin St", "province": "Metro Manila"}	09243423977	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
807ce8f3-7088-4ebe-9507-d18fd626d08e	\N	\N	{"full_name": "Chloe Santos"}	{"city": "Manila", "street": "111 Kin St", "province": "Metro Manila"}	09878917716	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
bd0906b1-ca13-45ed-9638-d1297099fa8b	{"full_name": "Noah Navarro"}	Business Owner	{"full_name": "Patricia Pineda"}	{"city": "Manila", "street": "16 Kin St", "province": "Cebu"}	09752162918	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
15fcb03c-8d71-4634-8642-d30767d02ea4	\N	\N	{"full_name": "Sofia Santos"}	{"city": "Davao", "street": "248 Kin St", "province": "Metro Manila"}	09486529812	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4de74611-4e36-4b4d-becc-672303b61eca	{"full_name": "Chloe Valdez"}	\N	{"full_name": "Mark Garcia"}	{"city": "Davao", "street": "209 Kin St", "province": "Davao del Sur"}	09643715086	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
05ab41f7-955f-4594-8838-bf228269e2e7	\N	Business Owner	{"full_name": "Olivia Mercado"}	{"city": "Cebu", "street": "148 Kin St", "province": "Davao del Sur"}	09165404306	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
243d02a5-8b94-49ba-9be1-ee2391df997d	\N	Engineer	{"full_name": "Olivia Aquino"}	{"city": "Cebu", "street": "45 Kin St", "province": "Metro Manila"}	09316578115	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a9655e0e-c848-4019-9cb8-4a4800fae8f1	\N	\N	{"full_name": "Mark Navarro"}	{"city": "Manila", "street": "134 Kin St", "province": "Metro Manila"}	09851516519	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ea9b230e-e62d-46ec-a361-0d671a7d3ac3	{"full_name": "Angela Domingo"}	\N	{"full_name": "Noah Mercado"}	{"city": "Manila", "street": "188 Kin St", "province": "Metro Manila"}	09415885341	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8503751d-84d4-4f15-be01-7b694fb99e03	\N	Business Owner	{"full_name": "Noah Santos"}	{"city": "Cebu", "street": "197 Kin St", "province": "Cebu"}	09102698559	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5883754f-2fc6-4bbe-b32e-763336b0b9bb	\N	Teacher	{"full_name": "Miguel Dela Cruz"}	{"city": "Davao", "street": "39 Kin St", "province": "Metro Manila"}	09946507793	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4f2b038b-c39c-419f-8dc4-573312dfc81c	\N	Engineer	{"full_name": "Olivia Salazar"}	{"city": "Davao", "street": "20 Kin St", "province": "Metro Manila"}	09255423471	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5736e0e2-3c76-47e3-bc85-7362a0ba0810	{"full_name": "Noah Flores"}	Business Owner	{"full_name": "Ava Pineda"}	{"city": "Davao", "street": "182 Kin St", "province": "Cebu"}	09867259630	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4e8191e5-1681-492c-8b1e-e009a8c542d1	\N	Business Owner	{"full_name": "Noah Domingo"}	{"city": "Manila", "street": "242 Kin St", "province": "Davao del Sur"}	09547451038	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
970c4aaf-e18c-4a44-98eb-6e1b363cdce1	{"full_name": "Liam Valdez"}	Business Owner	{"full_name": "Bea Valdez"}	{"city": "Davao", "street": "110 Kin St", "province": "Metro Manila"}	09665387286	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	\N	Teacher	{"full_name": "Ava Mercado"}	{"city": "Davao", "street": "83 Kin St", "province": "Davao del Sur"}	09629337339	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	\N	\N	{"full_name": "Liam Ramos"}	{"city": "Manila", "street": "39 Kin St", "province": "Metro Manila"}	09461754474	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a4f6e888-4d7a-4d44-8e37-a7813d848321	{"full_name": "Kevin Villanueva"}	Engineer	{"full_name": "Rica Garcia"}	{"city": "Davao", "street": "210 Kin St", "province": "Cebu"}	09994633650	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b843a2fa-6035-4f64-998a-59ede57b3a5a	\N	Teacher	{"full_name": "Liam Reyes"}	{"city": "Davao", "street": "225 Kin St", "province": "Cebu"}	09853214743	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8d804703-fe50-4766-8ec9-d792c53b4d7f	{"full_name": "Emma Torres"}	\N	{"full_name": "Jasmine Flores"}	{"city": "Manila", "street": "27 Kin St", "province": "Cebu"}	09208595526	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	{"full_name": "Noah Flores"}	Business Owner	{"full_name": "Patricia Torres"}	{"city": "Cebu", "street": "21 Kin St", "province": "Metro Manila"}	09186349169	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0affd4fd-56f6-49dc-ab47-d191881ae9f6	\N	Teacher	{"full_name": "Chloe Dela Cruz"}	{"city": "Manila", "street": "47 Kin St", "province": "Metro Manila"}	09733509702	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7ac3efa3-a8dc-4b08-9116-6287a9de2b86	\N	\N	{"full_name": "Jose Salazar"}	{"city": "Davao", "street": "201 Kin St", "province": "Cebu"}	09367531765	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	{"full_name": "Juan Villanueva"}	\N	{"full_name": "Daniel Bautista"}	{"city": "Cebu", "street": "167 Kin St", "province": "Cebu"}	09736966315	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: leave_application_types; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.leave_application_types (id, leave_application_id, leave_type_id, date_from, date_to, number_of_days, other_leave_details) FROM stdin;
70a72f5b-16e4-4ce5-85f8-8fa7731de03e	81f64f7a-22e1-4df6-b790-239714afc75e	1	2026-05-01	2026-05-03	3.0	\N
67acfae0-7673-4ed6-bdf5-b4713989136e	60d5829b-4cdd-40f9-a5f0-737f1bf1b7d0	1	2026-06-05	2026-06-20	16.0	\N
5d924fc3-fd3c-420e-89ac-2c4e3538b38e	d58a5d02-9284-457d-bf9e-ae37e9018d24	1	2026-06-05	2026-06-19	15.0	\N
fb045881-8aa0-4682-bdf3-fe089ea7f46b	652d6614-4f4c-4185-9cec-2a2c9e77d5f1	1	2026-05-15	2026-05-30	16.0	\N
\.


--
-- Data for Name: leave_applications; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.leave_applications (id, employee_id, date_filed, reason, department_unit, substitute_name, subjects_covered, status, remarks, created_at, updated_at) FROM stdin;
81f64f7a-22e1-4df6-b790-239714afc75e	4de74611-4e36-4b4d-becc-672303b61eca	2026-05-21	\N	222	\N	[]	PENDING	\N	2026-05-22 03:51:39.195131	2026-05-22 03:51:39.195131
60d5829b-4cdd-40f9-a5f0-737f1bf1b7d0	b708e15f-6869-4f21-b539-ccf6a2e9b49b	2026-05-01	\N	\N	\N	[{"day": "FRI-SAT", "time": "7:00AM-8:30AM", "subject": "AS104", "substitute_name": ""}]	PENDING	\N	2026-05-22 03:52:05.800272	2026-05-22 03:52:05.800272
d58a5d02-9284-457d-bf9e-ae37e9018d24	15fcb03c-8d71-4634-8642-d30767d02ea4	2026-05-22	\N	\N	\N	[{"day": "FRI-SAT", "time": "7:00AM-8:30AM", "subject": "AS104", "substitute_name": ""}]	PENDING	\N	2026-05-22 03:55:49.766285	2026-05-22 03:55:49.766285
652d6614-4f4c-4185-9cec-2a2c9e77d5f1	243d02a5-8b94-49ba-9be1-ee2391df997d	2026-05-22	\N	\N	\N	[]	APPROVED	\N	2026-05-22 03:58:47.625972	2026-05-22 03:58:47.625972
\.


--
-- Data for Name: leave_types; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.leave_types (id, name, description, is_active, created_at) FROM stdin;
1	Vacation Leave	\N	t	2026-05-01 13:23:08.908567
3	Emergency Leave	\N	t	2026-05-01 13:23:08.908567
4	Maternity Leave	\N	t	2026-05-01 13:23:08.908567
5	Paternity Leave	\N	t	2026-05-01 13:23:08.908567
6	Special Leave	\N	t	2026-05-01 13:23:08.908567
2	Sick Leave	\N	f	2026-05-01 13:23:08.908567
7	Legally	\N	f	2026-05-11 15:34:47.626762
8	Purpose	\N	f	2026-05-11 15:35:21.432133
10	Others2	\N	t	2026-05-18 19:49:31.716969
9	Furniture2	\N	t	2026-05-11 15:54:40.052229
17	Solo Parent Leave	\N	t	2026-05-22 13:34:30.415291
18	Study Leave	\N	t	2026-05-22 13:34:30.418616
19	Others	\N	t	2026-05-22 13:34:30.424423
\.


--
-- Data for Name: other_information; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.other_information (employee_id, has_criminal_case, criminal_case_details, has_admin_offense, admin_offense_details, was_separated_employment, separation_details, created_at, updated_at) FROM stdin;
4b769217-7871-4b4d-96fb-e30eac1e381c	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
09565e28-12a8-48b9-b85b-f96973ff77d7	f	\N	f	\N	t	Contract ended	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d86db822-8838-417d-aa9f-a5de699ea7c9	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
553785c4-605f-44c8-907e-99151018f079	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4ac742ce-72ee-426b-94c1-036739890960	f	\N	f	\N	t	Contract ended	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
fda81a86-ed25-4ba4-b9af-a0195f24794d	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
807ce8f3-7088-4ebe-9507-d18fd626d08e	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
bd0906b1-ca13-45ed-9638-d1297099fa8b	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
15fcb03c-8d71-4634-8642-d30767d02ea4	t	Case dismissed	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4de74611-4e36-4b4d-becc-672303b61eca	t	Case dismissed	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
05ab41f7-955f-4594-8838-bf228269e2e7	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
243d02a5-8b94-49ba-9be1-ee2391df997d	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a9655e0e-c848-4019-9cb8-4a4800fae8f1	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ea9b230e-e62d-46ec-a361-0d671a7d3ac3	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8503751d-84d4-4f15-be01-7b694fb99e03	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5883754f-2fc6-4bbe-b32e-763336b0b9bb	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4f2b038b-c39c-419f-8dc4-573312dfc81c	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5736e0e2-3c76-47e3-bc85-7362a0ba0810	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4e8191e5-1681-492c-8b1e-e009a8c542d1	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
970c4aaf-e18c-4a44-98eb-6e1b363cdce1	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a4f6e888-4d7a-4d44-8e37-a7813d848321	f	\N	t	Administrative warning issued	t	Contract ended	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b843a2fa-6035-4f64-998a-59ede57b3a5a	t	Case dismissed	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8d804703-fe50-4766-8ec9-d792c53b4d7f	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0affd4fd-56f6-49dc-ab47-d191881ae9f6	f	\N	f	\N	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7ac3efa3-a8dc-4b08-9116-6287a9de2b86	f	\N	t	Administrative warning issued	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	f	\N	t	Administrative warning issued	f	\N	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: password_resets; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.password_resets (id, user_id, token_hash, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: permissions; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.permissions (id, code) FROM stdin;
\.


--
-- Data for Name: personal_data; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.personal_data (employee_id, last_name, first_name, middle_name, name_extension, sex, birth_date, civil_status, citizenship, religion, blood_type, address, email, contact_number, created_at, updated_at) FROM stdin;
4b769217-7871-4b4d-96fb-e30eac1e381c	Mercado	Noah	B.	\N	MALE	1991-01-26	SEPARATED	Filipino	Roman Catholic	O+	{"zip": "8698", "city": "Quezon City", "street": "214 Sample St", "barangay": "Barangay 6", "province": "Cebu"}	noah.mercado.1@mail.com	09661795016	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
09565e28-12a8-48b9-b85b-f96973ff77d7	Valdez	Ana	C.	\N	MALE	1975-08-02	SEPARATED	Filipino	Roman Catholic	O-	{"zip": "9325", "city": "Cebu City", "street": "57 Sample St", "barangay": "Barangay 16", "province": "Laguna"}	ana.valdez.2@mail.com	09429074710	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	Ramos	Daniel	E.	\N	FEMALE	1988-03-21	MARRIED	Filipino	Roman Catholic	B-	{"zip": "8860", "city": "Davao City", "street": "135 Sample St", "barangay": "Barangay 18", "province": "Davao del Sur"}	daniel.ramos.4@mail.com	09678051511	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
553785c4-605f-44c8-907e-99151018f079	Mercado	Chloe	F.	\N	MALE	1972-05-26	SEPARATED	Filipino	Roman Catholic	AB+	{"zip": "1227", "city": "Davao City", "street": "11 Sample St", "barangay": "Barangay 21", "province": "Laguna"}	chloe.mercado.5@mail.com	09317595162	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
fda81a86-ed25-4ba4-b9af-a0195f24794d	Navarro	Sofia	H.	\N	FEMALE	1986-03-29	SEPARATED	Filipino	Roman Catholic	A-	{"zip": "4783", "city": "Quezon City", "street": "165 Sample St", "barangay": "Barangay 7", "province": "Laguna"}	sofia.navarro.7@mail.com	09708792646	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
807ce8f3-7088-4ebe-9507-d18fd626d08e	Reyes	Emma	I.	\N	MALE	1988-07-07	SEPARATED	Filipino	Roman Catholic	B+	{"zip": "9862", "city": "Davao City", "street": "205 Sample St", "barangay": "Barangay 17", "province": "Davao del Sur"}	emma.reyes.8@mail.com	09222754850	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
bd0906b1-ca13-45ed-9638-d1297099fa8b	Domingo	Ethan	J.	\N	FEMALE	1981-09-27	MARRIED	Filipino	Roman Catholic	AB+	{"zip": "9595", "city": "Davao City", "street": "201 Sample St", "barangay": "Barangay 30", "province": "Davao del Sur"}	ethan.domingo.9@mail.com	09146468463	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4de74611-4e36-4b4d-becc-672303b61eca	Pineda	Lucas	L.	\N	FEMALE	1972-11-24	MARRIED	Filipino	Roman Catholic	O+	{"zip": "2002", "city": "Cebu City", "street": "250 Sample St", "barangay": "Barangay 2", "province": "Metro Manila"}	lucas.pineda.11@mail.com	09797944351	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
243d02a5-8b94-49ba-9be1-ee2391df997d	Pineda	Ava	N.	\N	FEMALE	1977-08-03	SEPARATED	Filipino	Roman Catholic	O-	{"zip": "9579", "city": "Quezon City", "street": "10 Sample St", "barangay": "Barangay 25", "province": "Metro Manila"}	ava.pineda.13@mail.com	09994899917	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a9655e0e-c848-4019-9cb8-4a4800fae8f1	Navarro	Jose	O.	\N	MALE	1979-11-03	MARRIED	Filipino	Roman Catholic	A-	{"zip": "8364", "city": "Manila", "street": "239 Sample St", "barangay": "Barangay 6", "province": "Davao del Sur"}	jose.navarro.14@mail.com	09168238758	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ea9b230e-e62d-46ec-a361-0d671a7d3ac3	Pineda	Maria	P.	\N	MALE	1974-04-16	MARRIED	Filipino	Roman Catholic	O+	{"zip": "7270", "city": "Davao City", "street": "12 Sample St", "barangay": "Barangay 8", "province": "Metro Manila"}	maria.pineda.15@mail.com	09451261568	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8503751d-84d4-4f15-be01-7b694fb99e03	Valdez	Olivia	Q.	\N	MALE	1979-11-13	SINGLE	Filipino	Roman Catholic	O-	{"zip": "3684", "city": "Davao City", "street": "84 Sample St", "barangay": "Barangay 16", "province": "Davao del Sur"}	olivia.valdez.16@mail.com	09376757937	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5883754f-2fc6-4bbe-b32e-763336b0b9bb	Bautista	Noah	R.	\N	MALE	1974-02-27	SEPARATED	Filipino	Roman Catholic	AB+	{"zip": "6586", "city": "Davao City", "street": "106 Sample St", "barangay": "Barangay 21", "province": "Metro Manila"}	noah.bautista.17@mail.com	09701895289	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4f2b038b-c39c-419f-8dc4-573312dfc81c	Mercado	Patricia	S.	\N	FEMALE	1971-09-09	MARRIED	Filipino	Roman Catholic	B+	{"zip": "8292", "city": "Manila", "street": "70 Sample St", "barangay": "Barangay 11", "province": "Cebu"}	patricia.mercado.18@mail.com	09579441110	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
5736e0e2-3c76-47e3-bc85-7362a0ba0810	Valdez	Miguel	T.	\N	MALE	1971-06-19	SEPARATED	Filipino	Roman Catholic	B-	{"zip": "9963", "city": "Cebu City", "street": "178 Sample St", "barangay": "Barangay 27", "province": "Davao del Sur"}	miguel.valdez.19@mail.com	09307387610	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
4e8191e5-1681-492c-8b1e-e009a8c542d1	Villanueva	Olivia	U.	\N	MALE	1996-03-23	SEPARATED	Filipino	Roman Catholic	AB-	{"zip": "4999", "city": "Cebu City", "street": "68 Sample St", "barangay": "Barangay 5", "province": "Cebu"}	olivia.villanueva.20@mail.com	09445811501	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
970c4aaf-e18c-4a44-98eb-6e1b363cdce1	Villanueva	Paolo	V.	\N	FEMALE	1981-07-22	MARRIED	Filipino	Roman Catholic	B+	{"zip": "8228", "city": "Cebu City", "street": "184 Sample St", "barangay": "Barangay 6", "province": "Cebu"}	paolo.villanueva.21@mail.com	09823987210	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	Mercado	Juan	W.	\N	FEMALE	1983-12-17	SINGLE	Filipino	Roman Catholic	B+	{"zip": "2529", "city": "Manila", "street": "107 Sample St", "barangay": "Barangay 21", "province": "Metro Manila"}	juan.mercado.22@mail.com	09877103408	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	Villanueva	Carlo	X.	\N	FEMALE	1985-12-03	SINGLE	Filipino	Roman Catholic	A+	{"zip": "2916", "city": "Manila", "street": "165 Sample St", "barangay": "Barangay 21", "province": "Cebu"}	carlo.villanueva.23@mail.com	09862882529	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
a4f6e888-4d7a-4d44-8e37-a7813d848321	Mercado	Olivia	Y.	\N	FEMALE	1970-05-08	SINGLE	Filipino	Roman Catholic	A+	{"zip": "2790", "city": "Cebu City", "street": "180 Sample St", "barangay": "Barangay 7", "province": "Metro Manila"}	olivia.mercado.24@mail.com	09701418539	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b843a2fa-6035-4f64-998a-59ede57b3a5a	Aquino	Carlo	Z.	\N	MALE	1980-12-16	MARRIED	Filipino	Roman Catholic	O+	{"zip": "6248", "city": "Cebu City", "street": "169 Sample St", "barangay": "Barangay 17", "province": "Cebu"}	carlo.aquino.25@mail.com	09515865416	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	Mendoza	Olivia	B.	\N	FEMALE	1994-05-13	WIDOWED	Filipino	Roman Catholic	O+	{"zip": "2336", "city": "Quezon City", "street": "115 Sample St", "barangay": "Barangay 15", "province": "Cebu"}	olivia.mendoza.27@mail.com	09107168492	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8d804703-fe50-4766-8ec9-d792c53b4d7f	Torres	Angela	A.		MALE	1982-03-26	SINGLE	Filipino	Roman Catholic	A+	{"zip": "1953", "city": "Cebu City", "street": "3 Sample St", "barangay": "Barangay 7", "house_no": "", "province": "Laguna"}	angela.torres.26@mail.com	09927279677	2026-03-26 03:24:30.523626	2026-03-26 11:53:59.889489
4ac742ce-72ee-426b-94c1-036739890960	Domingo	Patricia	G.		FEMALE	1988-03-26	SINGLE	Filipino	Roman Catholic	B+	{"zip": "1874", "city": "Davao City", "street": "170 Sample St", "barangay": "Barangay 9", "house_no": "", "province": "Davao del Sur"}	patricia.domingo.6@mail.com	09837399286	2026-03-26 03:24:30.523626	2026-03-26 11:54:19.901063
d86db822-8838-417d-aa9f-a5de699ea7c9	Torres	Daniel	D.		MALE	1990-05-25	MARRIED	Filipino	Roman Catholic	B-	{"zip": "7252", "city": "Cebu City", "street": "12 Sample St", "barangay": "Barangay 27", "house_no": "", "province": "Metro Manila"}	daniel.torres.3@mail.com	09305352957	2026-03-26 03:24:30.523626	2026-05-25 02:12:24.25342
05ab41f7-955f-4594-8838-bf228269e2e7	Aquino	Miguel	M.		FEMALE	1971-05-28	SEPARATED	Filipino	Roman Catholic	A+	{"zip": "1091", "city": "Cebu City", "street": "30 Sample St", "barangay": "Barangay 29", "house_no": "", "province": "Davao del Sur"}	miguel.aquino.12@mail.com	09295012229	2026-03-26 03:24:30.523626	2026-05-25 02:13:21.870958
0affd4fd-56f6-49dc-ab47-d191881ae9f6	Aquino	Ethan	C.	\N	MALE	1987-07-17	MARRIED	Filipino	Roman Catholic	B+	{"zip": "9736", "city": "Manila", "street": "161 Sample St", "barangay": "Barangay 25", "province": "Cebu"}	ethan.aquino.28@mail.com	09814617846	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
7ac3efa3-a8dc-4b08-9116-6287a9de2b86	Aquino	Jasmine	D.	\N	MALE	1999-12-20	SEPARATED	Filipino	Roman Catholic	B+	{"zip": "9860", "city": "Quezon City", "street": "239 Sample St", "barangay": "Barangay 6", "province": "Cebu"}	jasmine.aquino.29@mail.com	09673676029	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	Bautista	Juan	E.	\N	MALE	1992-08-26	SINGLE	Filipino	Roman Catholic	AB-	{"zip": "9138", "city": "Quezon City", "street": "200 Sample St", "barangay": "Barangay 19", "province": "Cebu"}	juan.bautista.30@mail.com	09213399060	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b708e15f-6869-4f21-b539-ccf6a2e9b49b	Martirez	Aaron	Rosario	III	MALE	2004-05-27	SINGLE	Filipino	Roman Catholic		{"zip": "", "city": "Labo", "street": "", "barangay": "Daguit", "house_no": "", "province": "Camarines Norte"}		09123456789	2026-03-26 11:49:09.6662	2026-05-25 02:09:18.338123
15fcb03c-8d71-4634-8642-d30767d02ea4	Domingo	Kevin	K.		FEMALE	2025-05-25	SEPARATED	Filipino	Roman Catholic	A-	{"zip": "5321", "city": "Manila", "street": "78 Sample St", "barangay": "Barangay 28", "house_no": "", "province": "Laguna"}	kevin.domingo.10@mail.com	09301709734	2026-03-26 03:24:30.523626	2026-05-25 02:12:01.920172
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.positions (id, name, description, is_active) FROM stdin;
1	Professor I	Teaching faculty rank I	t
2	Professor II	Teaching faculty rank II	t
3	Instructor	Teaching faculty instructor level	t
4	Registrar	Registrar office personnel	t
5	HR Officer	Human resources personnel	t
7	IT Support Staff	Technical support staff	t
9	Maneger's	Boss	t
8	Manager's		f
13	Professor III	Teaching faculty rank III	t
14	Associate Professor I	Associate professor rank I	t
15	Associate Professor II	Associate professor rank II	t
16	Assistant Professor I	Assistant professor rank I	t
17	Assistant Professor II	Assistant professor rank II	t
18	Instructor I	Instructor rank I	t
19	Instructor II	Instructor rank II	t
20	Instructor III	Instructor rank III	t
23	Accounting Staff	Accounting office staff	t
25	Administrative Assistant	Administrative support staff	t
26	Security Guard	Campus security personnel	t
27	Utility Staff	Utility and maintenance staff	t
28	Librarian	Library personnel	t
29	Guidance Counselor	Student guidance counselor	t
30	Cashier	Finance cashier	t
6	Accounting Staff2	Accounting office staff2	f
\.


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.role_permissions (role_id, permission_id) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.roles (id, role_name) FROM stdin;
\.


--
-- Data for Name: training_programs; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.training_programs (id, employee_id, title, place, date_from, date_to, hours, conducted_by, created_at, updated_at) FROM stdin;
16142bae-d13b-46da-bf37-3430cf0e9f4d	4b769217-7871-4b4d-96fb-e30eac1e381c	Workplace Ethics Seminar	Davao	2026-02-03	2026-02-06	43	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d34dbdd9-d5ae-4b1e-b3dc-2803fe8cd9a8	09565e28-12a8-48b9-b85b-f96973ff77d7	Workplace Ethics Seminar	Online	2022-01-06	2022-01-08	13	CHED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
11a36d1c-8d14-41eb-938c-66bab504597c	d86db822-8838-417d-aa9f-a5de699ea7c9	Data Privacy Compliance	Cebu	2021-01-27	2021-02-01	14	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
129537af-fec9-4f06-8312-51d6ab0795a1	04c1ff35-9b4e-4e96-8d2c-3b8bb0f3dfcf	HRIS Process Training	Online	2019-05-17	2019-05-18	25	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
da5cc845-7c9e-4d38-bcd6-c0997378c766	553785c4-605f-44c8-907e-99151018f079	Data Privacy Compliance	Davao	2024-01-05	2024-01-10	40	CSC	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d40c75e9-a548-4e98-84e3-f4538e294c0b	4ac742ce-72ee-426b-94c1-036739890960	HRIS Process Training	Davao	2020-01-12	2020-01-13	29	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ed2d2224-bead-44da-8b82-686000a374e5	fda81a86-ed25-4ba4-b9af-a0195f24794d	Employee Relations Workshop	Online	2021-11-20	2021-11-23	22	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
3b5c8a22-9195-46f3-84bd-9d7961c9433d	807ce8f3-7088-4ebe-9507-d18fd626d08e	HRIS Process Training	Davao	2025-12-11	2025-12-13	37	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0aa871c5-44ed-4396-80e1-34288579a785	bd0906b1-ca13-45ed-9638-d1297099fa8b	Workplace Ethics Seminar	Online	2019-11-18	2019-11-23	36	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
212c2ea5-59ed-4c09-8bff-8ace07c11702	15fcb03c-8d71-4634-8642-d30767d02ea4	HRIS Process Training	Online	2020-10-17	2020-10-20	39	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
85daa9ab-666e-4213-a4e0-6bfb740eeac1	4de74611-4e36-4b4d-becc-672303b61eca	Workplace Ethics Seminar	Manila	2025-09-15	2025-09-19	36	CSC	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b8b51ec4-3ce0-4e0b-a41e-19b37007bead	05ab41f7-955f-4594-8838-bf228269e2e7	Employee Relations Workshop	Manila	2025-03-20	2025-03-24	22	CSC	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
b8dd7b44-679d-4a4f-8b04-8b5d16fec1eb	243d02a5-8b94-49ba-9be1-ee2391df997d	Data Privacy Compliance	Online	2023-01-30	2023-02-04	46	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
8d1632a2-e35f-47b6-93e7-89cce0239817	a9655e0e-c848-4019-9cb8-4a4800fae8f1	HRIS Process Training	Online	2022-05-29	2022-06-03	28	CHED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
15532413-20b4-4826-8422-bf43d41ffbb4	ea9b230e-e62d-46ec-a361-0d671a7d3ac3	Employee Relations Workshop	Online	2022-07-31	2022-08-03	19	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
9ef98e75-cdb3-40b3-9fc3-a009add2e00b	8503751d-84d4-4f15-be01-7b694fb99e03	Employee Relations Workshop	Manila	2024-03-03	2024-03-06	34	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
08aa36c5-3412-4fc5-a960-8e99c7707fa9	5883754f-2fc6-4bbe-b32e-763336b0b9bb	Workplace Ethics Seminar	Cebu	2022-10-19	2022-10-22	13	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
25bd0c86-e82a-4231-babf-da3371e8e6f7	4f2b038b-c39c-419f-8dc4-573312dfc81c	Leadership Training	Cebu	2018-04-19	2018-04-23	19	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2d98fc0c-359c-404e-9fa5-70dc26e0dba0	5736e0e2-3c76-47e3-bc85-7362a0ba0810	Employee Relations Workshop	Davao	2021-04-20	2021-04-25	45	CHED	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
51ac22cc-e238-43f4-a089-cdec634881ea	4e8191e5-1681-492c-8b1e-e009a8c542d1	Data Privacy Compliance	Manila	2023-06-24	2023-06-29	18	CSC	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
12acc6cd-e2e2-4c4e-8ef0-04ce13c9ce29	970c4aaf-e18c-4a44-98eb-6e1b363cdce1	Workplace Ethics Seminar	Cebu	2024-01-16	2024-01-20	31	CSC	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
2c3cc1c1-9106-4b1f-8805-a8415c7564e5	6ea3eb5f-18f9-4386-ab16-8a2b1bf12626	Data Privacy Compliance	Davao	2019-08-08	2019-08-09	13	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
ab77cb7d-839d-4fde-a69a-6d11f0cc7521	1fb00d25-36fb-4b48-bcaf-11836ee3c9a8	Data Privacy Compliance	Online	2019-07-25	2019-07-27	47	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
d5f362ea-f103-424c-ae67-028045f7baa5	a4f6e888-4d7a-4d44-8e37-a7813d848321	Workplace Ethics Seminar	Cebu	2024-01-21	2024-01-23	24	CSC	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
200dd40c-8fe6-4b9c-9831-5727bb3ee954	b843a2fa-6035-4f64-998a-59ede57b3a5a	HRIS Process Training	Cebu	2022-08-13	2022-08-16	44	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
08a383dd-9d97-4060-af97-bd976deb4e25	8d804703-fe50-4766-8ec9-d792c53b4d7f	Workplace Ethics Seminar	Davao	2025-10-06	2025-10-11	12	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
0285681e-5931-43ea-ad76-01eea3a485e6	51a8b1b2-b88c-4739-98b9-ad1aa3c9afcd	Data Privacy Compliance	Davao	2024-02-29	2024-03-02	38	Internal Training Unit	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
f47c0790-7ad2-47db-8c86-935f1c098800	0affd4fd-56f6-49dc-ab47-d191881ae9f6	Data Privacy Compliance	Cebu	2018-07-07	2018-07-08	45	CSC	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
e9a3600e-89fa-4551-a896-948be045a346	7ac3efa3-a8dc-4b08-9116-6287a9de2b86	Data Privacy Compliance	Davao	2023-09-09	2023-09-12	17	CSC	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
403c2fba-156e-4d59-a47f-fa1b46933e9e	afb982f6-e1ff-4d3a-9d1d-4dfc007732ac	Employee Relations Workshop	Cebu	2024-10-27	2024-10-31	48	DepEd	2026-03-26 03:24:30.523626	2026-03-26 03:24:30.523626
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: hris_user
--

COPY public.users (id, email, password, role, is_active, created_at, updated_at) FROM stdin;
48ac2e1c-03b2-4a08-8d33-d28bf65bbc1e	hris.system2026@gmail.com	$2b$10$fhchnT8rXSB.IBacF3Q7EentqsNLnoI0dRK9OkKxbdrfUBRT6fYKO	ADMIN	t	2026-03-26 03:24:30.523626	2026-03-26 03:27:01.591482
4783cad6-cbfb-45a4-9937-8913a066e03f	admin@mabinicolleges.edu	\\\\\\.jloDNROENKHcy	ADMIN	t	2026-05-22 15:05:41.082611	2026-05-22 15:14:03.613894
\.


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hris_user
--

SELECT pg_catalog.setval('public.departments_id_seq', 127, true);


--
-- Name: designations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hris_user
--

SELECT pg_catalog.setval('public.designations_id_seq', 68, true);


--
-- Name: leave_types_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hris_user
--

SELECT pg_catalog.setval('public.leave_types_id_seq', 92, true);


--
-- Name: permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hris_user
--

SELECT pg_catalog.setval('public.permissions_id_seq', 1, false);


--
-- Name: positions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hris_user
--

SELECT pg_catalog.setval('public.positions_id_seq', 123, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: hris_user
--

SELECT pg_catalog.setval('public.roles_id_seq', 1, false);


--
-- Name: childrens childrens_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.childrens
    ADD CONSTRAINT childrens_pkey PRIMARY KEY (id);


--
-- Name: departments departments_name_key; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: designations designations_name_key; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_name_key UNIQUE (name);


--
-- Name: designations designations_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);


--
-- Name: education_honors education_honors_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.education_honors
    ADD CONSTRAINT education_honors_pkey PRIMARY KEY (id);


--
-- Name: education_majors education_majors_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.education_majors
    ADD CONSTRAINT education_majors_pkey PRIMARY KEY (id);


--
-- Name: education_minors education_minors_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.education_minors
    ADD CONSTRAINT education_minors_pkey PRIMARY KEY (id);


--
-- Name: education_scholarships education_scholarships_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.education_scholarships
    ADD CONSTRAINT education_scholarships_pkey PRIMARY KEY (id);


--
-- Name: educational_qualifications educational_qualifications_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.educational_qualifications
    ADD CONSTRAINT educational_qualifications_pkey PRIMARY KEY (id);


--
-- Name: employee_references employee_references_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employee_references
    ADD CONSTRAINT employee_references_pkey PRIMARY KEY (id);


--
-- Name: employees employees_employee_no_key; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_no_key UNIQUE (employee_no);


--
-- Name: employees employees_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);


--
-- Name: employment_data employment_data_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employment_data
    ADD CONSTRAINT employment_data_pkey PRIMARY KEY (employee_id);


--
-- Name: employment_history employment_history_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT employment_history_pkey PRIMARY KEY (id);


--
-- Name: examinations_taken examinations_taken_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.examinations_taken
    ADD CONSTRAINT examinations_taken_pkey PRIMARY KEY (id);


--
-- Name: faculties faculties_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);


--
-- Name: family_background family_background_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.family_background
    ADD CONSTRAINT family_background_pkey PRIMARY KEY (employee_id);


--
-- Name: leave_application_types leave_application_types_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.leave_application_types
    ADD CONSTRAINT leave_application_types_pkey PRIMARY KEY (id);


--
-- Name: leave_applications leave_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.leave_applications
    ADD CONSTRAINT leave_applications_pkey PRIMARY KEY (id);


--
-- Name: leave_types leave_types_name_key; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_name_key UNIQUE (name);


--
-- Name: leave_types leave_types_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);


--
-- Name: other_information other_information_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.other_information
    ADD CONSTRAINT other_information_pkey PRIMARY KEY (employee_id);


--
-- Name: password_resets password_resets_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);


--
-- Name: permissions permissions_code_key; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);


--
-- Name: permissions permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);


--
-- Name: personal_data personal_data_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.personal_data
    ADD CONSTRAINT personal_data_pkey PRIMARY KEY (employee_id);


--
-- Name: positions positions_name_key; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_name_key UNIQUE (name);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);


--
-- Name: role_permissions role_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: roles roles_role_name_key; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);


--
-- Name: training_programs training_programs_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_pkey PRIMARY KEY (id);


--
-- Name: employees unique_employee_user; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT unique_employee_user UNIQUE (user_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: childrens trg_children_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_children_updated BEFORE UPDATE ON public.childrens FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: educational_qualifications trg_educational_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_educational_updated BEFORE UPDATE ON public.educational_qualifications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: employment_history trg_employment_history_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_employment_history_updated BEFORE UPDATE ON public.employment_history FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: employment_data trg_employment_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_employment_updated BEFORE UPDATE ON public.employment_data FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: examinations_taken trg_examination_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_examination_updated BEFORE UPDATE ON public.examinations_taken FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: faculties trg_faculty_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_faculty_updated BEFORE UPDATE ON public.faculties FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: family_background trg_family_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_family_updated BEFORE UPDATE ON public.family_background FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: education_honors trg_honor_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_honor_updated BEFORE UPDATE ON public.education_honors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: leave_application_types trg_leave_app_types_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_leave_app_types_updated BEFORE UPDATE ON public.leave_application_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: education_majors trg_major_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_major_updated BEFORE UPDATE ON public.education_majors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: education_minors trg_minor_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_minor_updated BEFORE UPDATE ON public.education_minors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: other_information trg_other_information_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_other_information_updated BEFORE UPDATE ON public.other_information FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: personal_data trg_personal_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_personal_updated BEFORE UPDATE ON public.personal_data FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: employee_references trg_reference_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_reference_updated BEFORE UPDATE ON public.employee_references FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: education_scholarships trg_scholarship_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_scholarship_updated BEFORE UPDATE ON public.education_scholarships FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: training_programs trg_training_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_training_updated BEFORE UPDATE ON public.training_programs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: users trg_user_updated; Type: TRIGGER; Schema: public; Owner: hris_user
--

CREATE TRIGGER trg_user_updated BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


--
-- Name: childrens fk_children_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.childrens
    ADD CONSTRAINT fk_children_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: educational_qualifications fk_educational_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.educational_qualifications
    ADD CONSTRAINT fk_educational_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employees fk_employee_user; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: employment_data fk_employment_designation; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employment_data
    ADD CONSTRAINT fk_employment_designation FOREIGN KEY (designation_id) REFERENCES public.designations(id) ON DELETE SET NULL;


--
-- Name: employment_data fk_employment_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employment_data
    ADD CONSTRAINT fk_employment_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employment_history fk_employment_history_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT fk_employment_history_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employment_data fk_employment_position; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employment_data
    ADD CONSTRAINT fk_employment_position FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;


--
-- Name: examinations_taken fk_examination_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.examinations_taken
    ADD CONSTRAINT fk_examination_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: faculties fk_faculty_department; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT fk_faculty_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;


--
-- Name: family_background fk_family_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.family_background
    ADD CONSTRAINT fk_family_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: education_honors fk_honor_education; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.education_honors
    ADD CONSTRAINT fk_honor_education FOREIGN KEY (education_id) REFERENCES public.educational_qualifications(id) ON DELETE CASCADE;


--
-- Name: leave_application_types fk_lat_application; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.leave_application_types
    ADD CONSTRAINT fk_lat_application FOREIGN KEY (leave_application_id) REFERENCES public.leave_applications(id) ON DELETE CASCADE;


--
-- Name: leave_application_types fk_lat_type; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.leave_application_types
    ADD CONSTRAINT fk_lat_type FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE RESTRICT;


--
-- Name: education_majors fk_major_education; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.education_majors
    ADD CONSTRAINT fk_major_education FOREIGN KEY (education_id) REFERENCES public.educational_qualifications(id) ON DELETE CASCADE;


--
-- Name: education_minors fk_minor_education; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.education_minors
    ADD CONSTRAINT fk_minor_education FOREIGN KEY (education_id) REFERENCES public.educational_qualifications(id) ON DELETE CASCADE;


--
-- Name: other_information fk_other_information_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.other_information
    ADD CONSTRAINT fk_other_information_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: password_resets fk_password_reset_user; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: personal_data fk_personal_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.personal_data
    ADD CONSTRAINT fk_personal_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: employee_references fk_reference_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.employee_references
    ADD CONSTRAINT fk_reference_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: faculties fk_reference_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT fk_reference_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: education_scholarships fk_scholarship_education; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.education_scholarships
    ADD CONSTRAINT fk_scholarship_education FOREIGN KEY (education_id) REFERENCES public.educational_qualifications(id) ON DELETE CASCADE;


--
-- Name: training_programs fk_training_employee; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT fk_training_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: leave_applications leave_applications_employee_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.leave_applications
    ADD CONSTRAINT leave_applications_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;


--
-- Name: role_permissions role_permissions_permission_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id);


--
-- Name: role_permissions role_permissions_role_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: hris_user
--

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict OKupgdeP2kPQrAMVVd9P5vtxIhK9yggY5mOJkBDajmdIxtfn0J7KEwanmENDcvC

