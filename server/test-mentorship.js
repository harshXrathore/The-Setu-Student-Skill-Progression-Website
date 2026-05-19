const API_URL = 'http://localhost:3000/api';

async function testMentorship() {
    try {
        console.log("Fetching mentors (Public)...");
        const response = await fetch(`${API_URL}/mentors`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Mentors found:", data.length);

        if (data.length === 0) {
            console.log("No mentors found. This is expected if DB is empty.");
        } else {
            console.log("First mentor:", data[0].user?.name || "No name populated");
        }

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testMentorship();
