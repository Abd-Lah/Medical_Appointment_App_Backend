<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Billing</title>
    <link rel="stylesheet" href="../styles/appointmentBilling.css">
</head>
<body>
<!-- Header Section -->
<header>
    <h1>Appointment Billing</h1>
</header>

<!-- Main Content -->
<main>
    <section class="billing-info">
        <h2>Appointment Details</h2>
        <table>
            <tr>
                <th>Patient</th>
                <td>${patient.firstName} ${patient.lastName}</td>
            </tr>
            <tr>
                <th>Doctor Name</th>
                <td>${doctor.firstName} ${doctor.lastName}</td>
            </tr>
            <tr>
                <th>Specialty</th>
                <td>${doctorProfile.specialty}</td>
            </tr>
            <tr>
                <th>Clinic Address</th>
                <td>${doctorProfile.clinicAddress}</td>
            </tr>
            <tr>
                <th>Consultation Duration</th>
                <td>${doctorProfile.appointmentDuration}</td>
            </tr>

        </table>
    </section>
</main>

<!-- Footer Section -->
<footer>
    <p>&copy; ${.now?string("yyyy")}Medical Appointment App. All rights reserved.</p>
</footer>
</body>
</html>
