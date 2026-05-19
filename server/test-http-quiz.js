const fetch = require('node-fetch');

const testApi = async () => {
    try {
        // 1. Login
        const loginRes = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        
        if (!loginData.token) {
            console.error("Login failed:", loginData);
            return;
        }

        // 2. Get first course
        const coursesRes = await fetch('http://localhost:3000/api/courses', {
            headers: { 'Authorization': `Bearer ${loginData.token}` }
        });
        const courses = await coursesRes.json();
        const courseId = courses[0]._id;

        console.log("Testing on course:", courseId);

        // 3. Add Quiz Lesson
        const payload = {
            title: "Frontend Quiz UI Test",
            type: "quiz",
            videoUrl: "",
            externalUrl: "",
            content: "",
            order: 5
        };

        const res = await fetch(`http://localhost:3000/api/courses/${courseId}/lessons`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${loginData.token}`
            },
            body: JSON.stringify(payload)
        });

        const status = res.status;
        const text = await res.text();
        console.log(`Add Lesson Response: ${status} - ${text}`);
    } catch (e) {
        console.error(e);
    }
};

testApi();
