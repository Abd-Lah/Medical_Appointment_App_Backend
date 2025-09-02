# Medical Appointment Web Application

## Project Overview
The **Medical Appointment Web Application** allows patients to book hospital appointments online without visiting in person. The system supports **admins, doctors, and patients**, providing role-specific functionality:

- **Admins** can validate doctor accounts.
- **Doctors** can manage profiles, working schedules, and generate reports after appointments.
- **Patients** can book, update, or cancel appointments under specific rules to prevent abuse.

### Key Features
- User registration for roles (Doctor, Patient).
- Doctor accounts must be validated by an admin.
- **Single appointment per patient** until the current appointment is completed.
- Patients can **cancel up to 4 appointments** within a given period (15 days).
- Doctor profiles include: bio, experience, specialty, clinic address, working days, start/end times, and break times.
- Appointment booking:
    - Only on the doctor’s **working days**.
    - Only within the doctor’s **working hours** and **not during break times**.
    - Appointment must be at least **30 minutes in the future**.
    - Appointments can be booked up to **15 days in advance**.
    - Cannot book a slot that is **already taken**.
- Appointment updates:
    - Only **pending and upcoming appointments** can be updated.
    - Updates must be made at least **8 hours before** the appointment.
    - Only **one update per appointment** is allowed.
- Automatic billing generation and email notifications (Mailtrap for testing).
- PDF reports generated after doctor approval.
- Persistent storage for profile pictures and invoices using Docker volumes.



---

## Tech Stack
- **Backend:** Spring Boot 3 with Spring Security 6
    - JWT authentication, roles: `ADMIN`, `DOCTOR`, `PATIENT`
- **Frontend:** HTML, CSS, JavaScript (static)
- **Database:** PostgreSQL 17
- **Mail Service:** Mailtrap (for testing emails)
- **Containerization:** Docker & Docker Compose
- **Other Tools:** Lombok, DTOs, mappers, custom exceptions

---

## Setup & Installation

### Prerequisites
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application 
Clone the repository:
```bash
git clone git@github.com:Abd-Lah/Medical_Appointment_App_Backend.git
cd Medical_Appointment_App_Backend

docker compose up --build -d   