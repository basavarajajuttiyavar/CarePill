-- Family Medicine Tracker — schema
-- Matches medication_tracker_database_tables.pdf exactly, with FK/constraints
-- added for integrity (per TRD Section 3 & 8).

CREATE TABLE Family (
  family_id     SERIAL PRIMARY KEY,
  family_name   VARCHAR(100) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  status        VARCHAR(20) NOT NULL DEFAULT 'pending'
);

CREATE TABLE FamilyMember (
  member_id                 SERIAL PRIMARY KEY,
  family_id                 INT NOT NULL REFERENCES Family(family_id) ON DELETE CASCADE,
  name                      VARCHAR(100) NOT NULL,
  date_of_birth             DATE,
  gender                    VARCHAR(20),
  relationship              VARCHAR(50),
  phone                     VARCHAR(15),
  email                     VARCHAR(150),
  blood_group               VARCHAR(5),
  allergies                 VARCHAR(255),
  chronic_conditions        VARCHAR(255),
  emergency_contact_name    VARCHAR(100),
  emergency_contact_phone   VARCHAR(15),
  created_at                TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_familymember_family_id ON FamilyMember(family_id);

CREATE TABLE AuthUser (
  auth_user_id   SERIAL PRIMARY KEY,
  name           VARCHAR(100) NOT NULL,
  email          VARCHAR(150) NOT NULL UNIQUE,
  password_hash  VARCHAR(255) NOT NULL,
  role           VARCHAR(20) NOT NULL DEFAULT 'admin', -- super_admin | admin | member
  phone          VARCHAR(20),
  family_id      INT REFERENCES Family(family_id) ON DELETE CASCADE,
  member_id      INT REFERENCES FamilyMember(member_id) ON DELETE SET NULL,
  status         VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending | active | rejected
  created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  last_login     TIMESTAMP
);
CREATE INDEX idx_authuser_family_id ON AuthUser(family_id);

CREATE TABLE Doctor (
  doctor_id       SERIAL PRIMARY KEY,
  doctor_name     VARCHAR(100) NOT NULL,
  specialization  VARCHAR(100),
  hospital        VARCHAR(150),
  clinic          VARCHAR(150),
  city            VARCHAR(100),
  state           VARCHAR(100),
  phone           VARCHAR(15)
);

CREATE TABLE Medicine (
  medicine_id         SERIAL PRIMARY KEY,
  member_id           INT NOT NULL REFERENCES FamilyMember(member_id) ON DELETE CASCADE,
  medicine_name       VARCHAR(150) NOT NULL,
  medicine_type       VARCHAR(50),
  dosage              VARCHAR(50),
  frequency           VARCHAR(50),
  quantity            INT,
  reason              VARCHAR(255),
  start_date          DATE,
  end_date            DATE,
  expiry_date         DATE,
  prescription_type   VARCHAR(20) NOT NULL DEFAULT 'self', -- doctor | self
  doctor_id           INT REFERENCES Doctor(doctor_id) ON DELETE SET NULL,
  notes               VARCHAR(500),
  created_at          TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_medicine_member_id ON Medicine(member_id);

CREATE TABLE DoseLog (
  dose_log_id     SERIAL PRIMARY KEY,
  medicine_id     INT NOT NULL REFERENCES Medicine(medicine_id) ON DELETE CASCADE,
  scheduled_time  TIME NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'upcoming', -- taken | missed | skipped | upcoming
  logged_at       TIMESTAMP
);
CREATE INDEX idx_doselog_medicine_id ON DoseLog(medicine_id);

CREATE TABLE ActivityLog (
  activity_log_id   SERIAL PRIMARY KEY,
  auth_user_id      INT REFERENCES AuthUser(auth_user_id) ON DELETE SET NULL,
  action            VARCHAR(100) NOT NULL,
  status            VARCHAR(20) NOT NULL DEFAULT 'success',
  created_at        TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Integrity rule from TRD Section 3: every Medicine row must resolve to
-- exactly one FamilyMember. member_id NOT NULL + FK above enforces this
-- at the DB layer, not just in application code.
