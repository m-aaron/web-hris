--
-- HRIS Database Schema
-- Contains all table structures, functions, triggers, and constraints
-- Does NOT contain user data (seeded separately by seed-docker.js)
--

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
-- Create uuid extension if not exists
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';

--
-- Create set_updated_at trigger function
--

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS trigger
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

-- ============================================================
-- TABLE: childrens
-- ============================================================

CREATE TABLE IF NOT EXISTS public.childrens (
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

-- ============================================================
-- TABLE: departments
-- ============================================================

CREATE TABLE IF NOT EXISTS public.departments (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.departments OWNER TO hris_user;

CREATE SEQUENCE IF NOT EXISTS public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.departments_id_seq OWNER TO hris_user;
ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;

-- ============================================================
-- TABLE: designations
-- ============================================================

CREATE TABLE IF NOT EXISTS public.designations (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    is_active boolean DEFAULT true NOT NULL
);

ALTER TABLE public.designations OWNER TO hris_user;

CREATE SEQUENCE IF NOT EXISTS public.designations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.designations_id_seq OWNER TO hris_user;
ALTER SEQUENCE public.designations_id_seq OWNED BY public.designations.id;

-- ============================================================
-- TABLE: education_honors
-- ============================================================

CREATE TABLE IF NOT EXISTS public.education_honors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    education_id uuid NOT NULL,
    honor_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.education_honors OWNER TO hris_user;

-- ============================================================
-- TABLE: education_majors
-- ============================================================

CREATE TABLE IF NOT EXISTS public.education_majors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    education_id uuid NOT NULL,
    major_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.education_majors OWNER TO hris_user;

-- ============================================================
-- TABLE: education_minors
-- ============================================================

CREATE TABLE IF NOT EXISTS public.education_minors (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    education_id uuid NOT NULL,
    minor_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.education_minors OWNER TO hris_user;

-- ============================================================
-- TABLE: education_scholarships
-- ============================================================

CREATE TABLE IF NOT EXISTS public.education_scholarships (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    education_id uuid NOT NULL,
    scholarship_name character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.education_scholarships OWNER TO hris_user;

-- ============================================================
-- TABLE: educational_qualifications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.educational_qualifications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    school character varying(255),
    year_started integer,
    year_finished integer,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_year_range CHECK (((year_started IS NULL) OR (year_finished IS NULL) OR (year_finished >= year_started)))
);

ALTER TABLE public.educational_qualifications OWNER TO hris_user;

-- ============================================================
-- TABLE: employee_references
-- ============================================================

CREATE TABLE IF NOT EXISTS public.employee_references (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    name jsonb NOT NULL,
    address jsonb,
    contact_number character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.employee_references OWNER TO hris_user;

-- ============================================================
-- TABLE: employees
-- ============================================================

CREATE TABLE IF NOT EXISTS public.employees (
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

-- ============================================================
-- TABLE: employment_data
-- ============================================================

CREATE TABLE IF NOT EXISTS public.employment_data (
    employee_id uuid NOT NULL,
    date_hired date NOT NULL,
    position_id integer,
    designation_id integer,
    salary numeric(12,2),
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
    CONSTRAINT chk_employment_status CHECK (((employment_status)::text = ANY ((ARRAY['REGULAR'::character varying, 'PROBATIONARY'::character varying, 'CONTRACTUAL'::character varying, 'RESIGNED'::character varying])::text[]))),
    CONSTRAINT employment_data_employment_basis_check CHECK (((employment_basis)::text = ANY ((ARRAY['FULL_TIME'::character varying, 'PART_TIME'::character varying, 'JOB_ORDER'::character varying])::text[])))
);

ALTER TABLE public.employment_data OWNER TO hris_user;

-- ============================================================
-- TABLE: employment_history
-- ============================================================

CREATE TABLE IF NOT EXISTS public.employment_history (
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

-- ============================================================
-- TABLE: examinations_taken
-- ============================================================

CREATE TABLE IF NOT EXISTS public.examinations_taken (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    date_taken date NOT NULL,
    rating character varying(100),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.examinations_taken OWNER TO hris_user;

-- ============================================================
-- TABLE: faculties
-- ============================================================

CREATE TABLE IF NOT EXISTS public.faculties (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    department_id integer,
    teaching_load character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.faculties OWNER TO hris_user;

-- ============================================================
-- TABLE: family_background
-- ============================================================

CREATE TABLE IF NOT EXISTS public.family_background (
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

-- ============================================================
-- TABLE: leave_application_types
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leave_application_types (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    leave_application_id uuid NOT NULL,
    leave_type_id integer NOT NULL,
    date_from date NOT NULL,
    date_to date NOT NULL,
    number_of_days numeric(6,1) NOT NULL,
    other_leave_details text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_leave_application_types_dates CHECK ((date_to >= date_from)),
    CONSTRAINT chk_leave_application_types_days CHECK ((number_of_days > (0)::numeric))
);

ALTER TABLE public.leave_application_types OWNER TO hris_user;

-- ============================================================
-- TABLE: leave_applications
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leave_applications (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    employee_id uuid NOT NULL,
    date_filed date NOT NULL DEFAULT CURRENT_DATE,
    reason text,
    department_unit character varying(255),
    substitute_name character varying(255),
    subjects_covered jsonb,
    remarks text,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_leave_application_status CHECK (((status)::text = ANY ((ARRAY['PENDING'::character varying, 'APPROVED'::character varying, 'DISAPPROVED'::character varying])::text[])))
);

ALTER TABLE public.leave_applications OWNER TO hris_user;

-- ============================================================
-- TABLE: leave_types
-- ============================================================

CREATE TABLE IF NOT EXISTS public.leave_types (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.leave_types OWNER TO hris_user;

CREATE SEQUENCE IF NOT EXISTS public.leave_types_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.leave_types_id_seq OWNER TO hris_user;
ALTER SEQUENCE public.leave_types_id_seq OWNED BY public.leave_types.id;

-- ============================================================
-- TABLE: other_information
-- ============================================================

CREATE TABLE IF NOT EXISTS public.other_information (
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

-- ============================================================
-- TABLE: password_resets
-- ============================================================

CREATE TABLE IF NOT EXISTS public.password_resets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    token_hash text NOT NULL,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);

ALTER TABLE public.password_resets OWNER TO hris_user;

-- ============================================================
-- TABLE: permissions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.permissions (
    id integer NOT NULL,
    code character varying(50) NOT NULL
);

ALTER TABLE public.permissions OWNER TO hris_user;

CREATE SEQUENCE IF NOT EXISTS public.permissions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.permissions_id_seq OWNER TO hris_user;
ALTER SEQUENCE public.permissions_id_seq OWNED BY public.permissions.id;

-- ============================================================
-- TABLE: personal_data
-- ============================================================

CREATE TABLE IF NOT EXISTS public.personal_data (
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

-- ============================================================
-- TABLE: positions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.positions (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    category character varying(20) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    CONSTRAINT chk_positions_category CHECK (((category)::text = ANY ((ARRAY['TEACHING'::character varying, 'NON_TEACHING'::character varying])::text[])))
);

ALTER TABLE public.positions OWNER TO hris_user;

CREATE SEQUENCE IF NOT EXISTS public.positions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.positions_id_seq OWNER TO hris_user;
ALTER SEQUENCE public.positions_id_seq OWNED BY public.positions.id;

-- ============================================================
-- TABLE: role_permissions
-- ============================================================

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id integer NOT NULL,
    permission_id integer NOT NULL
);

ALTER TABLE public.role_permissions OWNER TO hris_user;

-- ============================================================
-- TABLE: roles
-- ============================================================

CREATE TABLE IF NOT EXISTS public.roles (
    id integer NOT NULL,
    role_name character varying(50) NOT NULL
);

ALTER TABLE public.roles OWNER TO hris_user;

CREATE SEQUENCE IF NOT EXISTS public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public.roles_id_seq OWNER TO hris_user;
ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;

-- ============================================================
-- TABLE: training_programs
-- ============================================================

CREATE TABLE IF NOT EXISTS public.training_programs (
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

-- ============================================================
-- TABLE: users
-- ============================================================

CREATE TABLE IF NOT EXISTS public.users (
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
-- Set column defaults (sequences)
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);
ALTER TABLE ONLY public.designations ALTER COLUMN id SET DEFAULT nextval('public.designations_id_seq'::regclass);
ALTER TABLE ONLY public.leave_types ALTER COLUMN id SET DEFAULT nextval('public.leave_types_id_seq'::regclass);
ALTER TABLE ONLY public.permissions ALTER COLUMN id SET DEFAULT nextval('public.permissions_id_seq'::regclass);
ALTER TABLE ONLY public.positions ALTER COLUMN id SET DEFAULT nextval('public.positions_id_seq'::regclass);
ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);

--
-- Add PRIMARY KEYS
--

ALTER TABLE ONLY public.childrens
    ADD CONSTRAINT childrens_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.education_honors
    ADD CONSTRAINT education_honors_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.education_majors
    ADD CONSTRAINT education_majors_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.education_minors
    ADD CONSTRAINT education_minors_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.education_scholarships
    ADD CONSTRAINT education_scholarships_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.educational_qualifications
    ADD CONSTRAINT educational_qualifications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.employee_references
    ADD CONSTRAINT employee_references_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.employment_data
    ADD CONSTRAINT employment_data_pkey PRIMARY KEY (employee_id);

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT employment_history_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.examinations_taken
    ADD CONSTRAINT examinations_taken_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT faculties_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.family_background
    ADD CONSTRAINT family_background_pkey PRIMARY KEY (employee_id);

ALTER TABLE ONLY public.leave_application_types
    ADD CONSTRAINT leave_application_types_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.leave_applications
    ADD CONSTRAINT leave_applications_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.other_information
    ADD CONSTRAINT other_information_pkey PRIMARY KEY (employee_id);

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT password_resets_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.personal_data
    ADD CONSTRAINT personal_data_pkey PRIMARY KEY (employee_id);

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id);

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT training_programs_pkey PRIMARY KEY (id);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);

--
-- Add UNIQUE constraints
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_name_key UNIQUE (name);

ALTER TABLE ONLY public.designations
    ADD CONSTRAINT designations_name_key UNIQUE (name);

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT employees_employee_no_key UNIQUE (employee_no);

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT unique_employee_user UNIQUE (user_id);

ALTER TABLE ONLY public.leave_types
    ADD CONSTRAINT leave_types_name_key UNIQUE (name);

ALTER TABLE ONLY public.permissions
    ADD CONSTRAINT permissions_code_key UNIQUE (code);

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_name_key UNIQUE (name);

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_role_name_key UNIQUE (role_name);

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);

--
-- Add TRIGGERS for updated_at timestamps
--

CREATE TRIGGER trg_children_updated
    BEFORE UPDATE ON public.childrens
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_departments_updated
    BEFORE UPDATE ON public.departments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_educational_updated
    BEFORE UPDATE ON public.educational_qualifications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_employment_history_updated
    BEFORE UPDATE ON public.employment_history
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_employment_updated
    BEFORE UPDATE ON public.employment_data
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_examination_updated
    BEFORE UPDATE ON public.examinations_taken
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_faculties_updated
    BEFORE UPDATE ON public.faculties
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_family_updated
    BEFORE UPDATE ON public.family_background
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_honor_updated
    BEFORE UPDATE ON public.education_honors
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_leave_application_types_updated
    BEFORE UPDATE ON public.leave_application_types
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_leave_applications_updated
    BEFORE UPDATE ON public.leave_applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_leave_types_updated
    BEFORE UPDATE ON public.leave_types
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_major_updated
    BEFORE UPDATE ON public.education_majors
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_minor_updated
    BEFORE UPDATE ON public.education_minors
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_other_information_updated
    BEFORE UPDATE ON public.other_information
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_personal_updated
    BEFORE UPDATE ON public.personal_data
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_reference_updated
    BEFORE UPDATE ON public.employee_references
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_scholarship_updated
    BEFORE UPDATE ON public.education_scholarships
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_training_updated
    BEFORE UPDATE ON public.training_programs
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_user_updated
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

--
-- Add FOREIGN KEY constraints
--

ALTER TABLE ONLY public.childrens
    ADD CONSTRAINT fk_children_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.educational_qualifications
    ADD CONSTRAINT fk_educational_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.employees
    ADD CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.employment_data
    ADD CONSTRAINT fk_employment_designation FOREIGN KEY (designation_id) REFERENCES public.designations(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.employment_data
    ADD CONSTRAINT fk_employment_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.employment_data
    ADD CONSTRAINT fk_employment_position FOREIGN KEY (position_id) REFERENCES public.positions(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.employment_history
    ADD CONSTRAINT fk_employment_history_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.examinations_taken
    ADD CONSTRAINT fk_examination_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT fk_faculties_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.faculties
    ADD CONSTRAINT fk_faculties_department FOREIGN KEY (department_id) REFERENCES public.departments(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.family_background
    ADD CONSTRAINT fk_family_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.education_honors
    ADD CONSTRAINT fk_honor_education FOREIGN KEY (education_id) REFERENCES public.educational_qualifications(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.leave_application_types
    ADD CONSTRAINT fk_leave_application_types_application FOREIGN KEY (leave_application_id) REFERENCES public.leave_applications(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.leave_application_types
    ADD CONSTRAINT fk_leave_application_types_leave_type FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE RESTRICT;

ALTER TABLE ONLY public.leave_applications
    ADD CONSTRAINT fk_leave_applications_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.education_majors
    ADD CONSTRAINT fk_major_education FOREIGN KEY (education_id) REFERENCES public.educational_qualifications(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.education_minors
    ADD CONSTRAINT fk_minor_education FOREIGN KEY (education_id) REFERENCES public.educational_qualifications(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.other_information
    ADD CONSTRAINT fk_other_information_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.password_resets
    ADD CONSTRAINT fk_password_reset_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.personal_data
    ADD CONSTRAINT fk_personal_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.employee_references
    ADD CONSTRAINT fk_reference_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.education_scholarships
    ADD CONSTRAINT fk_scholarship_education FOREIGN KEY (education_id) REFERENCES public.educational_qualifications(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.training_programs
    ADD CONSTRAINT fk_training_employee FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id);

ALTER TABLE ONLY public.role_permissions
    ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id);

--
-- End of schema dump
--
