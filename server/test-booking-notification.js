const fetch = require('node-fetch');

async function testBooking() {
    console.log("Starting test booking process...");

    // Assuming we have a test user and mentor id from previous scripts or the database
    // Fetching the first mentor available
    const mentorsRes = await fetch('http://localhost:5000/api/mentors');
    if (!mentorsRes.ok) throw new Error("Could not fetch mentors");
    const mentors = await mentorsRes.json();

    if (mentors.length === 0) {
        console.log("No Mentors found in the database. Cannot test.");
        return;
    }

    const firstMentorId = mentors[0].user._id || mentors[0].user;
    console.log(`Found mentor: ${firstMentorId}`);

    // We need a student token to book. Let's log in as a student.
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@example.com', password: 'password123' })
    });

    if (!loginRes.ok) {
        console.log("Login failed. Ensure student@example.com / password123 exists.");
        return;
    }
    const loginData = await loginRes.json();
    const token = loginData.token;

    console.log("Successfully logged in as student.");

    // Prepare date based on Mentor's general availability or a fallback date
    let selectedDate = new Date();
    selectedDate.setDate(selectedDate.getDate() + 1); // Tomorrow

    // Now trigger the booking API
    const bookRes = await fetch('http://localhost:5000/api/mentors/book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({
            mentorId: firstMentorId,
            topic: "Test Booking Subject",
            date: selectedDate.toISOString(),
            notes: "Test notes for notification trigger"
        })
    });

    const bookData = await bookRes.json();

    if (bookRes.ok) {
        console.log("Booking created successfully via API:", bookData);
    } else {
        console.error("Booking API Failed:", bookData);
    }
}

testBooking().catch(console.error);
