-- Sample Cases for Courtroom Simulator
-- Created automatically by Cursor AI (2024-12-19)

-- Case 1: Criminal - Simple Theft
INSERT INTO cases (id, title, case_type, summary, status, created_at) VALUES (
    'case-001',
    'State v. Johnson - Theft Case',
    'criminal',
    'On March 15, 2024, John Johnson allegedly stole a laptop computer valued at $1,200 from the office of Sarah Wilson. Security camera footage shows Johnson entering the building at 2:30 PM and leaving at 3:15 PM. Wilson testified that she last saw her laptop on her desk at 2:00 PM and discovered it missing at 4:00 PM. The laptop was later found in Johnson''s apartment during a search warrant execution. Johnson claims he found the laptop in the parking lot and was planning to return it.',
    'active',
    NOW()
);

-- Case 2: Civil - Breach of Contract
INSERT INTO cases (id, title, case_type, summary, status, created_at) VALUES (
    'case-002',
    'Smith Construction v. Davis Properties',
    'civil',
    'Smith Construction entered into a contract with Davis Properties to build a commercial office building for $500,000. The contract specified completion by December 1, 2024. Smith Construction alleges that Davis Properties breached the contract by failing to make timely payments and by making unauthorized changes to the building specifications. Davis Properties counterclaims that Smith Construction breached by failing to complete the project on time and by using substandard materials. The building was ultimately completed on January 15, 2025, but Davis Properties refused to pay the final $100,000 installment.',
    'active',
    NOW()
);

-- Case 3: Civil - Negligence
INSERT INTO cases (id, title, case_type, summary, status, created_at) VALUES (
    'case-003',
    'Brown v. City Transit Authority',
    'civil',
    'On February 10, 2024, Mary Brown was injured when a City Transit Authority bus driver, Robert Martinez, allegedly ran a red light and collided with Brown''s vehicle. Brown suffered a broken arm, whiplash, and $15,000 in medical expenses. Brown alleges that Martinez was negligent in failing to stop at the red light and that the City Transit Authority is vicariously liable. The City Transit Authority claims that the traffic light was malfunctioning and that Brown was partially at fault for not yielding to emergency vehicles. Witness testimony and traffic camera footage are conflicting regarding the color of the light at the time of the accident.',
    'active',
    NOW()
);

-- Parties for Case 1 (Criminal)
INSERT INTO parties (id, case_id, name, side, role) VALUES
('party-001-1', 'case-001', 'State of California', 'prosecution', 'prosecutor'),
('party-001-2', 'case-001', 'John Johnson', 'defense', 'defendant');

-- Parties for Case 2 (Civil)
INSERT INTO parties (id, case_id, name, side, role) VALUES
('party-002-1', 'case-002', 'Smith Construction LLC', 'plaintiff', 'plaintiff'),
('party-002-2', 'case-002', 'Davis Properties Inc.', 'defendant', 'defendant');

-- Parties for Case 3 (Civil)
INSERT INTO parties (id, case_id, name, side, role) VALUES
('party-003-1', 'case-003', 'Mary Brown', 'plaintiff', 'plaintiff'),
('party-003-2', 'case-003', 'City Transit Authority', 'defendant', 'defendant');

-- Witnesses for Case 1
INSERT INTO witnesses (id, case_id, name, role, credibility_notes) VALUES
('witness-001-1', 'case-001', 'Sarah Wilson', 'victim', 'Office manager, credible witness'),
('witness-001-2', 'case-001', 'Michael Chen', 'witness', 'Security guard who reviewed footage'),
('witness-001-3', 'case-001', 'John Johnson', 'defendant', 'Claims to have found laptop');

-- Witnesses for Case 2
INSERT INTO witnesses (id, case_id, name, role, credibility_notes) VALUES
('witness-002-1', 'case-002', 'David Smith', 'expert', 'Construction manager, 20 years experience'),
('witness-002-2', 'case-002', 'Jennifer Davis', 'witness', 'Property owner, made change requests'),
('witness-002-3', 'case-002', 'Robert Wilson', 'expert', 'Construction inspector, independent');

-- Witnesses for Case 3
INSERT INTO witnesses (id, case_id, name, role, credibility_notes) VALUES
('witness-003-1', 'case-003', 'Mary Brown', 'plaintiff', 'Injured party'),
('witness-003-2', 'case-003', 'Robert Martinez', 'witness', 'Bus driver, potential bias'),
('witness-003-3', 'case-003', 'Dr. Sarah Johnson', 'expert', 'Medical expert, orthopedic surgeon');

-- Exhibits for Case 1
INSERT INTO exhibits (id, case_id, code, title, description, type, status, file_path) VALUES
('exhibit-001-1', 'case-001', 'Exhibit A', 'Security Camera Footage', 'Digital video showing Johnson entering and leaving building', 'video', 'admitted', '/exhibits/case-001/video-001.mp4'),
('exhibit-001-2', 'case-001', 'Exhibit B', 'Receipt for Laptop', 'Original purchase receipt showing laptop value', 'document', 'admitted', '/exhibits/case-001/receipt-001.pdf'),
('exhibit-001-3', 'case-001', 'Exhibit C', 'Search Warrant Affidavit', 'Police affidavit describing search and seizure', 'document', 'admitted', '/exhibits/case-001/warrant-001.pdf');

-- Exhibits for Case 2
INSERT INTO exhibits (id, case_id, code, title, description, type, status, file_path) VALUES
('exhibit-002-1', 'case-002', 'Exhibit A', 'Construction Contract', 'Original signed contract with specifications', 'document', 'admitted', '/exhibits/case-002/contract-001.pdf'),
('exhibit-002-2', 'case-002', 'Exhibit B', 'Email Correspondence', 'Emails showing change requests and communications', 'document', 'admitted', '/exhibits/case-002/emails-001.pdf'),
('exhibit-002-3', 'case-002', 'Exhibit C', 'Construction Photos', 'Photographic evidence of construction progress', 'image', 'admitted', '/exhibits/case-002/photos-001.zip');

-- Exhibits for Case 3
INSERT INTO exhibits (id, case_id, code, title, description, type, status, file_path) VALUES
('exhibit-003-1', 'case-003', 'Exhibit A', 'Traffic Camera Footage', 'Video showing intersection at time of accident', 'video', 'admitted', '/exhibits/case-003/traffic-001.mp4'),
('exhibit-003-2', 'case-003', 'Exhibit B', 'Medical Records', 'Brown''s medical treatment records', 'document', 'admitted', '/exhibits/case-003/medical-001.pdf'),
('exhibit-003-3', 'case-003', 'Exhibit C', 'Traffic Light Maintenance Log', 'City records of traffic light maintenance', 'document', 'admitted', '/exhibits/case-003/maintenance-001.pdf');

-- Counts for Case 1 (Criminal)
INSERT INTO counts (id, case_id, name, description, burden, elements) VALUES
('count-001-1', 'case-001', 'Grand Theft', 'Theft of property valued over $950', 'beyond_reasonable_doubt', '["taking", "property_of_another", "without_consent", "intent_to_deprive"]');

-- Counts for Case 2 (Civil)
INSERT INTO counts (id, case_id, name, description, burden, elements) VALUES
('count-002-1', 'case-002', 'Breach of Contract', 'Failure to perform contractual obligations', 'preponderance', '["valid_contract", "breach", "damages"]'),
('count-002-2', 'case-002', 'Counterclaim - Breach', 'Failure to complete project on time', 'preponderance', '["valid_contract", "breach", "damages"]');

-- Counts for Case 3 (Civil)
INSERT INTO counts (id, case_id, name, description, burden, elements) VALUES
('count-003-1', 'case-003', 'Negligence', 'Failure to exercise reasonable care', 'preponderance', '["duty", "breach", "causation", "damages"]'),
('count-003-2', 'case-003', 'Vicarious Liability', 'Employer liability for employee actions', 'preponderance', '["employment_relationship", "scope_of_employment", "negligent_act"]');
