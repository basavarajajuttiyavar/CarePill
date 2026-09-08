-- Sample data matching the Sharma Family mockups, for local dev/demo.

INSERT INTO Family (family_name) VALUES ('Sharma Family');

INSERT INTO FamilyMember (family_id, name, date_of_birth, gender, relationship, phone, blood_group, allergies)
VALUES
  (1, 'Rahul Sharma', '1979-03-12', 'Male', 'Father', '+919845011223', 'O+', 'Penicillin'),
  (1, 'Sunita Sharma', '1981-08-25', 'Female', 'Mother', '+919845033445', 'A+', NULL),
  (1, 'Pihu Sharma', '2009-01-10', 'Female', 'Daughter', NULL, 'B+', 'Dust'),
  (1, 'Rohan Sharma', '2012-06-05', 'Male', 'Son', NULL, 'O+', NULL);

-- password_hash below is a bcrypt hash of 'password123' — dev only, never use in production
INSERT INTO AuthUser (name, email, password_hash, role, family_id, member_id)
VALUES ('Neha Sharma', 'neha@example.com', '$2b$10$ner1q9T3WerWZlf2yE1z6OOyg6Lx4b605m5WopIMatYGijjVndCoG', 'admin', 1, NULL);

INSERT INTO Doctor (doctor_name, specialization, hospital, city, state, phone)
VALUES
  ('Dr. Kavita Rao', 'Cardiologist', 'Manipal Hospital', 'Bengaluru', 'Karnataka', '+918041234567'),
  ('Dr. Arjun Mehta', 'Endocrinologist', 'Apollo Clinic', 'Bengaluru', 'Karnataka', '+918049876543');

INSERT INTO Medicine (member_id, medicine_name, medicine_type, dosage, frequency, quantity, reason, prescription_type, doctor_id)
VALUES
  (1, 'Telma 40mg', 'Tablet', '1 Tablet', 'Morning', 30, 'Blood pressure', 'doctor', 1),
  (1, 'Metformin 500mg', 'Tablet', '1 Tablet', 'Afternoon', 30, 'Blood sugar', 'doctor', 2),
  (1, 'Calcium Tablet', 'Tablet', '1 Tablet', 'Night', 30, 'Supplement', 'self', NULL),
  (2, 'Metformin 500mg', 'Tablet', '1 Tablet', 'Afternoon', 30, 'Blood sugar', 'doctor', 2),
  (2, 'Vitamin D3', 'Capsule', '1 Capsule', 'Morning', 30, 'Supplement', 'self', NULL),
  (3, 'Cetirizine', 'Tablet', '1 Tablet', 'Night', 10, 'Dust allergy', 'self', NULL),
  (4, 'Calcium Tablet', 'Tablet', '1 Tablet', 'Night', 30, 'Growth', 'self', NULL),
  (4, 'Multivitamin', 'Tablet', '1 Tablet', 'Morning', 30, 'Supplement', 'self', NULL);

INSERT INTO DoseLog (medicine_id, scheduled_time, status)
VALUES
  (1, '08:00', 'taken'),
  (2, '13:00', 'upcoming'),
  (3, '20:00', 'upcoming');
