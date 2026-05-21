const API_URL = 'http://localhost:3000/api';

async function testPhase3() {
    try {
        console.log("--- Testing Courses ---");
        const coursesRes = await fetch(`${API_URL}/courses`);
        if (!coursesRes.ok) throw new Error("Courses fetch failed");
        const courses = await coursesRes.json();
        console.log(`Courses found: ${courses.length}`);

        console.log("--- Testing Mistakes ---");
        // Needs proper auth, but we'll try to hit the endpoint.
        // It's protected, so we might get 401, which confirms route exists at least.
        const mistakesRes = await fetch(`${API_URL}/mistakes`);
        console.log(`Mistakes endpoint status: ${mistakesRes.status}`);
        if (mistakesRes.status === 401) {
            console.log("Auth working on mistakes endpoint (401 Expected without token)");
        } else {
            const mistakes = await mistakesRes.json();
            console.log(`Mistakes found: ${mistakes.length}`);
        }

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testPhase3();
