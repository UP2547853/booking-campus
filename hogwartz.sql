CREATE TABLE students (
    student_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    age INT,
    class_name VARCHAR(20)
);

CREATE TABLE teachers (
    teacher_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    subject VARCHAR(50)
);

CREATE TABLE facility_staff (
    staff_id SERIAL PRIMARY KEY,
    full_name VARCHAR(100),
    role VARCHAR(50)
);

CREATE TABLE facilities (
    facility_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50) -- e.g., Classroom, Gym, Pool
);

CREATE TABLE classrooms (
    classroom_id SERIAL PRIMARY KEY,
    facility_id INT REFERENCES facilities(facility_id),
    room_number VARCHAR(10),
    capacity INT
);

CREATE TABLE facility_bookings (
    booking_id SERIAL PRIMARY KEY,
    facility_id INT REFERENCES facilities(facility_id),
    booked_by INT,
    date DATE,
    start_time TIME,
    end_time TIME,
    booking_action VARCHAR(20)  -- Add, Modify, Cancel
);

DO $$
BEGIN
    FOR i IN 1..100 LOOP
        INSERT INTO students (full_name, age, class_name)
        VALUES ('Student ' || i, 6 + (i % 6), 'Class ' || chr(64 + (i % 6) + 1));
    END LOOP;
END;
$$;

DO $$
BEGIN
    FOR i IN 1..10 LOOP
        INSERT INTO teachers (full_name, subject)
        VALUES ('Teacher ' || i, 'Subject ' || (i % 5 + 1));
    END LOOP;
END;
$$;

INSERT INTO facility_staff (full_name, role) VALUES
('Staff A', 'Classroom'),
('Staff B', 'Badminton Court'),
('Staff C', 'Swimming Pool'),
('Staff D', 'Gym');

INSERT INTO facilities (name, type) VALUES
('Classroom 1', 'Classroom'),
('Classroom 2', 'Classroom'),
('Classroom 3', 'Classroom'),
('Classroom 4', 'Classroom'),
('Badminton Court', 'Court'),
('Swimming Pool', 'Pool'),
('Gym', 'Gym');

INSERT INTO classrooms (facility_id, room_number, capacity) VALUES
(1, 'CR101', 30),
(2, 'CR102', 30),
(3, 'CR103', 30),
(4, 'CR104', 30);

ALTER TABLE facility_bookings
ADD COLUMN booking_action VARCHAR(20);  -- e.g., Add, Modify, Cancel

CREATE ROLE "Staff A";
CREATE ROLE "Staff B";
CREATE ROLE "Staff C";
CREATE ROLE "Staff D";

CREATE VIEW staff_a_bookings AS
SELECT * FROM facility_bookings WHERE facility_id = 1-4;

CREATE VIEW staff_b_bookings AS
SELECT * FROM facility_bookings WHERE facility_id = 5;

CREATE VIEW staff_c_bookings AS
SELECT * FROM facility_bookings WHERE facility_id = 6;

CREATE VIEW staff_d_bookings AS
SELECT * FROM facility_bookings WHERE facility_id = 7;

GRANT SELECT, INSERT, UPDATE, DELETE ON staff_a_bookings TO "Staff A";
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_b_bookings TO "Staff B";
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_c_bookings TO "Staff C";
GRANT SELECT, INSERT, UPDATE, DELETE ON staff_d_bookings TO "Staff D";

