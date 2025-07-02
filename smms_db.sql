
-- =====================================================
-- 2. INSERT CLASSES
-- =====================================================
INSERT INTO dbo.class (class_name, description, school_year) VALUES
('1A', 'Grade 1 Class A', 2025),
('1B', 'Grade 1 Class B', 2025),
('2A', 'Grade 2 Class A', 2025),
('2B', 'Grade 2 Class B', 2025),
('3A', 'Grade 3 Class A', 2025),
('3B', 'Grade 3 Class B', 2025);

-- =====================================================
-- 3. INSERT ACCOUNTS
-- =====================================================
DECLARE @admin1_id UNIQUEIDENTIFIER = NEWID();
DECLARE @admin2_id UNIQUEIDENTIFIER = NEWID();
DECLARE @nurse1_id UNIQUEIDENTIFIER = NEWID();
DECLARE @nurse2_id UNIQUEIDENTIFIER = NEWID();
DECLARE @parent1_id UNIQUEIDENTIFIER = NEWID();
DECLARE @parent2_id UNIQUEIDENTIFIER = NEWID();
DECLARE @parent3_id UNIQUEIDENTIFIER = NEWID();
DECLARE @parent4_id UNIQUEIDENTIFIER = NEWID();
DECLARE @student1_id UNIQUEIDENTIFIER = NEWID();
DECLARE @student2_id UNIQUEIDENTIFIER = NEWID();
DECLARE @student3_id UNIQUEIDENTIFIER = NEWID();
DECLARE @student4_id UNIQUEIDENTIFIER = NEWID();
DECLARE @student5_id UNIQUEIDENTIFIER = NEWID();
DECLARE @student6_id UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.account (account_id, username, email, password, role_id, full_name, dob, gender, phone, locked, class_id) VALUES
(@admin1_id, 'admin1', 'admin1@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 5, 'Alice Johnson', '1980-05-15', 'F', '555-0101', 0, NULL),
(@admin2_id, 'admin2', 'admin2@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 5, 'Bob Smith', '1975-08-22', 'M', '555-0102', 0, NULL),
(@nurse1_id, 'nurse1', 'nurse1@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 3, 'Carol Davis', '1985-03-10', 'F', '555-0201', 0, NULL),
(@nurse2_id, 'nurse2', 'nurse2@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 3, 'David Wilson', '1982-11-18', 'M', '555-0202', 0, NULL),
(@parent1_id, 'parent1', 'parent1@email.com', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 2, 'Emma Brown', '1988-04-12', 'F', '555-0301', 0, NULL),
(@parent2_id, 'parent2', 'parent2@email.com', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 2, 'Frank Miller', '1986-09-25', 'M', '555-0302', 0, NULL),
(@parent3_id, 'parent3', 'parent3@email.com', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 2, 'Grace Lee', '1990-01-30', 'F', '555-0303', 0, NULL),
(@parent4_id, 'parent4', 'parent4@email.com', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 2, 'Henry Taylor', '1987-07-14', 'M', '555-0304', 0, NULL),
(@student1_id, 'student1', 'student1@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 1, 'Isabella Garcia', '2015-06-20', 'F', '555-0401', 0, 1),
(@student2_id, 'student2', 'student2@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 1, 'Jack Anderson', '2015-03-15', 'M', '555-0402', 0, 1),
(@student3_id, 'student3', 'student3@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 1, 'Katie Martinez', '2014-11-08', 'F', '555-0403', 0, 2),
(@student4_id, 'student4', 'student4@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 1, 'Liam Thompson', '2014-08-12', 'M', '555-0404', 0, 2),
(@student5_id, 'student5', 'student5@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 1, 'Mia Rodriguez', '2013-12-25', 'F', '555-0405', 0, 3),
(@student6_id, 'student6', 'student6@school.edu', '$2a$10$AaTC12NmxAQm/f370oqJ3eHwBU2AVLYwXQ3yu.a7zi/BpkbtsGYbG', 1, 'Noah White', '2013-05-18', 'M', '555-0406', 0, 3);

-- =====================================================
-- 4. INSERT STUDENT-PARENT RELATIONSHIPS
-- =====================================================
INSERT INTO dbo.student_parent (parent_id, student_id) VALUES
(@parent1_id, @student1_id),
(@parent1_id, @student2_id),
(@parent2_id, @student3_id),
(@parent3_id, @student4_id),
(@parent4_id, @student5_id),
(@parent4_id, @student6_id);

-- =====================================================
-- 5. INSERT MEDICAL PROFILES
-- =====================================================
INSERT INTO dbo.medical_profile (student_id, record_id, allergies, chronic_diseases, past_treatments, vision_status_left, vision_status_right, hearing_status, immunization_status, last_updated) VALUES
(@student1_id, 1001, 'Peanuts, Shellfish', 'Asthma', 'Appendectomy 2020', '20/20', '20/20', 'Normal', 'Complete', '2024-01-15'),
(@student2_id, 1002, 'None', 'None', 'None', '20/25', '20/25', 'Normal', 'Complete', '2024-01-16'),
(@student3_id, 1003, 'Dairy', 'None', 'Tonsillectomy 2021', '20/20', '20/30', 'Normal', 'Complete', '2024-01-17'),
(@student4_id, 1004, 'None', 'Diabetes Type 1', 'None', '20/20', '20/20', 'Normal', 'Complete', '2024-01-18'),
(@student5_id, 1005, 'Eggs', 'None', 'None', '20/30', '20/30', 'Normal', 'Complete', '2024-01-19'),
(@student6_id, 1006, 'None', 'None', 'None', '20/20', '20/20', 'Normal', 'Complete', '2024-01-20');

-- =====================================================
-- 6. INSERT VACCINES
-- =====================================================
INSERT INTO dbo.vaccine (name, type, version, release_date, confirmed_at) VALUES
('COVID-19 Pfizer', 'Viral Vector', 'v1.0', '2021-01-01', '2021-01-15'),
('COVID-19 Moderna', 'mRNA', 'v1.0', '2021-01-15', '2021-02-01'),
('MMR', 'Live Attenuated', 'v2.0', '2020-06-01', '2020-06-15'),
('DTaP', 'Toxoid', 'v3.0', '2020-03-01', '2020-03-15'),
('Varicella', 'Live Attenuated', 'v1.5', '2020-09-01', '2020-09-15'),
('Hepatitis B', 'Recombinant', 'v2.1', '2020-12-01', '2020-12-15');

-- =====================================================
-- 7. INSERT VACCINE BATCHES
-- =====================================================
INSERT INTO dbo.vaccine_batch (vaccine_id, stock_in_date, expiry_date) VALUES
(1, '2024-01-01', '2025-01-01'),
(1, '2024-02-01', '2025-02-01'),
(2, '2024-01-15', '2025-01-15'),
(3, '2024-03-01', '2026-03-01'),
(4, '2024-02-15', '2026-02-15'),
(5, '2024-04-01', '2026-04-01'),
(6, '2024-03-15', '2026-03-15');

-- =====================================================
-- 8. INSERT VACCINATION NOTICES
-- =====================================================
INSERT INTO dbo.vaccination_notice (title, description, vaccine_name, date, created_at) VALUES
('Annual Flu Shot Campaign', 'Annual influenza vaccination for all students', 'Influenza Vaccine', '2024-10-15', '2024-09-01'),
('COVID-19 Booster Shot', 'COVID-19 booster vaccination for eligible students', 'COVID-19 Pfizer', '2024-11-01', '2024-10-01'),
('MMR Vaccination Drive', 'Measles, Mumps, and Rubella vaccination campaign', 'MMR', '2024-12-01', '2024-11-01'),
('DTaP Booster', 'Diphtheria, Tetanus, and Pertussis booster', 'DTaP', '2025-01-15', '2024-12-15'),
('Varicella Vaccination', 'Chickenpox vaccination for unvaccinated students', 'Varicella', '2025-02-01', '2025-01-01');

-- =====================================================
-- 9. INSERT VACCINATION CONFIRMATIONS
-- =====================================================
INSERT INTO dbo.vaccination_confirmation (vaccine_notice_id, vaccine_batch_id, student_id, parent_id, status, confirmed_at) VALUES
(1, 1, @student1_id, @parent1_id, 'CONFIRMED', '2024-09-15'),
(1, 1, @student2_id, @parent1_id, 'CONFIRMED', '2024-09-16'),
(2, 3, @student3_id, @parent2_id, 'PENDING', '2024-10-15'),
(3, 4, @student4_id, @parent3_id, 'CONFIRMED', '2024-11-15'),
(4, 5, @student5_id, @parent4_id, 'DECLINED', '2024-12-20');

-- =====================================================
-- 10. INSERT VACCINATION RECORDS
-- =====================================================
INSERT INTO dbo.vaccination_record (student_id, nurse_id, vaccine_notice_id, results, date) VALUES
(@student1_id, @nurse1_id, 1, 'SUCCESSFUL', '2024-10-15'),
(@student2_id, @nurse1_id, 1, 'SUCCESSFUL', '2024-10-15'),
(@student3_id, @nurse2_id, 2, 'SUCCESSFUL', '2024-11-01'),
(@student4_id, @nurse1_id, 3, 'SUCCESSFUL', '2024-12-01'),
(@student5_id, @nurse2_id, 4, 'SUCCESSFUL', '2025-01-15');

-- =====================================================
-- 11. INSERT HEALTH CHECK NOTICES
-- =====================================================
INSERT INTO dbo.health_check_notice (title, description, date, created_at) VALUES
('Annual Physical Examination', 'Comprehensive health check for all students', '2024-09-20', '2024-08-01'),
('Vision Screening', 'Annual vision screening for all students', '2024-10-10', '2024-09-01'),
('Hearing Test', 'Annual hearing screening for all students', '2024-11-05', '2024-10-01'),
('Dental Check-up', 'Annual dental examination', '2024-12-15', '2024-11-15'),
('Growth and Development Assessment', 'Height, weight, and development check', '2025-01-20', '2024-12-20');

-- =====================================================
-- 12. INSERT HEALTH CHECK CONFIRMATIONS
-- =====================================================
INSERT INTO dbo.health_check_confirmation (check_notice_id, student_id, parent_id, status, confirmed_at) VALUES
(1, @student1_id, @parent1_id, 'CONFIRMED', '2024-08-15'),
(1, @student2_id, @parent1_id, 'CONFIRMED', '2024-08-16'),
(2, @student3_id, @parent2_id, 'PENDING', '2024-09-15'),
(3, @student4_id, @parent3_id, 'CONFIRMED', '2024-10-15'),
(4, @student5_id, @parent4_id, 'DECLINED', '2024-11-20');

-- =====================================================
-- 13. INSERT HEALTH CHECK RECORDS
-- =====================================================
INSERT INTO dbo.health_check_record (student_id, nurse_id, check_notice_id, results, date) VALUES
(@student1_id, @nurse1_id, 1, 'HEALTHY', '2024-09-20'),
(@student2_id, @nurse1_id, 1, 'HEALTHY', '2024-09-20'),
(@student3_id, @nurse2_id, 2, 'NEEDS_GLASSES', '2024-10-10'),
(@student4_id, @nurse1_id, 3, 'HEALTHY', '2024-11-05'),
(@student5_id, @nurse2_id, 4, 'HEALTHY', '2024-12-15');

-- =====================================================
-- 14. INSERT HEALTH EVENTS
-- =====================================================
INSERT INTO dbo.health_event (student_id, nurse_id, event_date, event_type, description, solution, note, status) VALUES
(@student1_id, @nurse1_id, '2024-09-15', 'INJURY', 'Fell during recess, minor scrape on knee', 'Cleaned wound, applied bandage', 'Monitor for infection', 'RESOLVED'),
(@student2_id, @nurse1_id, '2024-09-20', 'ILLNESS', 'Complaining of headache and fever', 'Given acetaminophen, sent home', 'Parent notified', 'RESOLVED'),
(@student3_id, @nurse2_id, '2024-10-05', 'ALLERGIC_REACTION', 'Allergic reaction to peanuts', 'Administered epinephrine, called ambulance', 'Severe reaction, requires follow-up', 'FOLLOW_UP_REQUIRED'),
(@student4_id, @nurse1_id, '2024-10-12', 'ASTHMA_ATTACK', 'Asthma attack during PE class', 'Used inhaler, monitored breathing', 'Improving, continue monitoring', 'RESOLVED'),
(@student5_id, @nurse2_id, '2024-11-01', 'DENTAL_EMERGENCY', 'Toothache, possible cavity', 'Given pain relief, recommended dentist visit', 'Schedule dental appointment', 'PENDING');

-- =====================================================
-- 15. INSERT HEALTH EVENT FOLLOW-UPS
-- =====================================================
INSERT INTO dbo.health_event_follow_up (event_id, parent_id, instruction, requires_doctor, status) VALUES
(1, @parent1_id, 'Keep wound clean and dry, change bandage daily', 0, 'COMPLETED'),
(2, @parent1_id, 'Monitor fever, rest at home for 24 hours', 0, 'COMPLETED'),
(3, @parent2_id, 'Schedule appointment with allergist, avoid peanuts', 1, 'PENDING'),
(4, @parent3_id, 'Continue using inhaler as prescribed', 0, 'COMPLETED'),
(5, @parent4_id, 'Schedule dental appointment within 1 week', 1, 'PENDING');

-- =====================================================
-- 16. INSERT MEDICATIONS
-- =====================================================
INSERT INTO dbo.medication (name, description, quantity, expiry_date) VALUES
('Acetaminophen 500mg', 'Pain reliever and fever reducer', 100, '2025-12-31'),
('Ibuprofen 200mg', 'Anti-inflammatory pain reliever', 75, '2025-11-30'),
('Epinephrine Auto-Injector', 'Emergency treatment for severe allergic reactions', 10, '2024-12-31'),
('Albuterol Inhaler', 'Bronchodilator for asthma', 25, '2025-06-30'),
('Antihistamine Tablets', 'For mild allergic reactions', 50, '2025-08-31'),
('Bandages', 'Various sizes for wound care', 200, '2026-12-31'),
('Antiseptic Solution', 'For cleaning wounds', 15, '2025-09-30'),
('Thermometer', 'Digital thermometer for temperature monitoring', 5, '2026-12-31');

-- =====================================================
-- 17. INSERT MEDICATION SENT RECORDS
-- =====================================================
INSERT INTO dbo.medication_sent (student_id, parent_id, medication_name, instructions, start_date, end_date, frequency_per_day, timing_notes, sent_at, amount) VALUES
(@student1_id, @parent1_id, 'Acetaminophen 500mg', 'Take 1 tablet every 4-6 hours as needed for fever', '2024-09-20', '2024-09-23', 4, 'Take with food', '2024-09-20 14:30:00', 12),
(@student2_id, @parent1_id, 'Ibuprofen 200mg', 'Take 1 tablet every 6-8 hours for pain', '2024-09-25', '2024-09-28', 3, 'Take with food', '2024-09-25 15:00:00', 9),
(@student3_id, @parent2_id, 'Epinephrine Auto-Injector', 'Use only in case of severe allergic reaction', '2024-10-05', '2024-12-31', 0, 'Emergency use only', '2024-10-05 10:00:00', 1),
(@student4_id, @parent3_id, 'Albuterol Inhaler', 'Use 2 puffs every 4-6 hours as needed for asthma', '2024-10-12', '2024-12-31', 4, 'Shake well before use', '2024-10-12 11:30:00', 1),
(@student5_id, @parent4_id, 'Antihistamine Tablets', 'Take 1 tablet daily for seasonal allergies', '2024-11-01', '2024-12-31', 1, 'Take in the morning', '2024-11-01 09:00:00', 60);

-- =====================================================
-- 18. INSERT EVENT MEDICATION USAGE
-- =====================================================
INSERT INTO dbo.event_medication_usage (event_id, medication_id, quantity_used, time, dosage) VALUES
(1, 1, 1, '2024-09-15 10:30:00', '500mg tablet'),
(2, 1, 1, '2024-09-20 14:00:00', '500mg tablet'),
(3, 3, 1, '2024-10-05 11:15:00', '0.3mg auto-injector'),
(4, 4, 2, '2024-10-12 13:45:00', '2 puffs'),
(5, 1, 1, '2024-11-01 15:20:00', '500mg tablet');

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Uncomment these queries to verify the data was inserted correctly
-- SELECT 'Accounts' as TableName, COUNT(*) as RecordCount FROM dbo.account
-- UNION ALL
-- SELECT 'Medical Profiles', COUNT(*) FROM dbo.medical_profile
-- UNION ALL
-- SELECT 'Vaccines', COUNT(*) FROM dbo.vaccine
-- UNION ALL
-- SELECT 'Vaccination Notices', COUNT(*) FROM dbo.vaccination_notice
-- UNION ALL
-- SELECT 'Health Events', COUNT(*) FROM dbo.health_event
-- UNION ALL
-- SELECT 'Medications', COUNT(*) FROM dbo.medication;
-- SELECT 'Student-Parent Relationships' as TableName, COUNT(*) as RecordCount FROM dbo.student_parent; 