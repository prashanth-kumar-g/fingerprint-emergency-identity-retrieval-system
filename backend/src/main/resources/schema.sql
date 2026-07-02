-- FEIRS Enterprise Schema Initialization --

DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS data_change_requests CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS citizens CASCADE;
DROP TABLE IF EXISTS operators CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS pending_institution_registrations CASCADE;
DROP TABLE IF EXISTS super_admins CASCADE;

CREATE TABLE super_admins (
    super_admin_id VARCHAR(50) PRIMARY KEY,
    admin_name VARCHAR(150) NOT NULL,
    master_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(20),
    profile_photo_url TEXT,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE pending_institution_registrations (
    registration_id BIGSERIAL PRIMARY KEY,
    institution_name VARCHAR(255) NOT NULL,
    official_email VARCHAR(255) NOT NULL UNIQUE,
    institution_type VARCHAR(100) NOT NULL,
    sector_type VARCHAR(100) NOT NULL,
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin_code VARCHAR(20),
	primary_officer_name VARCHAR(150) NOT NULL,
    officer_designation VARCHAR(150) NOT NULL,
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(20),
    institution_logo_url TEXT,
    verification_document_url TEXT NOT NULL,
    routed_super_admin_id VARCHAR(50) REFERENCES super_admins(super_admin_id),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE institutions (
    institution_id VARCHAR(50) PRIMARY KEY,
	institution_name VARCHAR(255) NOT NULL,
    official_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    institution_type VARCHAR(100) NOT NULL,
    sector_type VARCHAR(100) NOT NULL,
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin_code VARCHAR(20),
    primary_officer_name VARCHAR(150) NOT NULL,
    officer_designation VARCHAR(150) NOT NULL,
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(20),
    institution_logo_url TEXT,
    verification_document_url TEXT NOT NULL,
    linked_super_admin_id VARCHAR(50) REFERENCES super_admins(super_admin_id),
    account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE operators (
    operator_id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) NOT NULL REFERENCES institutions(institution_id),
    official_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),
    full_name VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation_title VARCHAR(150) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(20),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin_code VARCHAR(20),
    profile_photo_url TEXT,
    account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    last_login_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE citizens (
    citizen_id VARCHAR(50) PRIMARY KEY,
    enrolling_operator_id VARCHAR(50) NOT NULL REFERENCES operators(operator_id),
    full_name VARCHAR(150) NOT NULL,
	email_address VARCHAR(255) NOT NULL UNIQUE,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(20),
    address_line_1 VARCHAR(255),
    address_line_2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100),
    pin_code VARCHAR(20),
    blood_group VARCHAR(10),
	severe_allergies TEXT,
    chronic_conditions TEXT,
    current_medications TEXT,
    medical_documents_url TEXT,
    live_photo_url TEXT,
    fingerprint_bmp_base64 TEXT NOT NULL,
    fingerprint_iso_template TEXT NOT NULL,
    account_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE emergency_contacts (
    contact_id VARCHAR(50) PRIMARY KEY,
    citizen_id VARCHAR(50) NOT NULL REFERENCES citizens(citizen_id),
    contact_name VARCHAR(150) NOT NULL,
    relationship VARCHAR(100) NOT NULL,
    phone_country_code VARCHAR(10),
    phone_number VARCHAR(20),
    email_address VARCHAR(255) NOT NULL,
    linked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE data_change_requests (
    request_id VARCHAR(50) PRIMARY KEY,
    institution_id VARCHAR(50) NOT NULL REFERENCES institutions(institution_id),
    update_category VARCHAR(100) NOT NULL,
    proposed_data TEXT NOT NULL,
    new_verification_document_url TEXT NOT NULL,
    request_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by_super_admin_id VARCHAR(50) REFERENCES super_admins(super_admin_id),
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE TABLE audit_logs (
    log_id BIGSERIAL PRIMARY KEY,
	timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(50) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    target_role VARCHAR(50) NOT NULL,
    action_status VARCHAR(50) NOT NULL,
    event_description TEXT NOT NULL,
    ip_address VARCHAR(45)
);
