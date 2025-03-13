<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Appointment Billing</title>
    <style>
            /* Reset some default styles */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', sans-serif;
            background-color: #f9f9f9;
            justify-content: center;
            align-items: center;
            padding: 20px;
            text-align: center;
            width: 600px;
            margin: auto;
        }

        header {
            background-color: #4CAF50;
            color: white;
            padding: 20px 0;
            width: 100%;
            border-radius: 10px 10px 0 0;
            margin-bottom: 30px;
        }

        h1 {
            font-size: 36px;
            margin: 0;
        }

        main {
            width: 100%;
            max-width: 800px;
            padding: 30px;
            background-color: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .billing-info {
            margin-top: 20px;
        }

        h2 {
            font-size: 28px;
            color: #333;
            margin-bottom: 20px;
            text-align: center;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 16px;
        }

        table th,
        table td {
            padding: 15px;
            text-align: center;
            border-bottom: 1px solid #ddd;
        }

        table th {
            width: 40%;
            background-color: #f4f4f4;
            color: #555;
            font-weight: bold;
        }

        table td {
            color: #333;
        }

        footer {
            text-align: center;
            margin-top: 30px;
            padding: 10px;
            background-color: #4CAF50;
            color: white;
            border-radius: 0 0 10px 10px;
        }

        footer p {
            font-size: 14px;
        }

    </style>
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
