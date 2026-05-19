// Native fetch is available in Node.js 18+

// Since we are in node environment for verification, let's use fetch directly with a helper
async function verifyProfileSystem() {
    const BASE_URL = 'http://localhost:3000/api';
    let token = '';
    let userId = '';

    console.log('--- Starting Profile System Verification ---');

    // 1. Login to get Token
    try {
        console.log('1. Logging in...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'verify2@example.com', password: 'password123' })
        });
        const loginData = await loginRes.json();

        if (!loginRes.ok) throw new Error(loginData.message);

        token = loginData.token;
        userId = loginData._id; // User ID return from login
        console.log('✅ Login successful. Token obtained.');
    } catch (error) {
        console.error('❌ Login failed:', error.message);
        return;
    }

    // 2. Create/Update Profile
    try {
        console.log('\n2. Creating/Updating Profile...');
        const profileData = {
            general: {
                firstName: "Verification",
                lastName: "User",
                bio: "This is a test profile created by verification script.",
                location: "New York, USA"
            },
            occupation: {
                role: "student",
                university: "Tech University",
                major: "Computer Science"
            },
            skills: ["JavaScript", "React", "Node.js", "MongoDB"],
            socials: {
                github: "https://github.com/verify",
                linkedin: "https://linkedin.com/in/verify"
            }
        };

        const updateRes = await fetch(`${BASE_URL}/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        const updateData = await updateRes.json();

        if (!updateRes.ok) throw new Error(updateData.message || 'Update failed');

        console.log('✅ Profile created/updated successfully.');
        console.log('   Bio:', updateData.general.bio);
    } catch (error) {
        console.error('❌ Profile update failed:', error.message);
    }

    // 3. Get Current Profile
    try {
        console.log('\n3. Fetching Current Profile...');
        const getRes = await fetch(`${BASE_URL}/profile/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const getData = await getRes.json();

        if (!getRes.ok) throw new Error(getData.message);

        if (getData.general.firstName === "Verification" && getData.skills.includes("MongoDB")) {
            console.log('✅ Profile fetch successful. Data matches.');
        } else {
            console.log('⚠️ Profile fetch successful but data verification failed.');
            console.log('Received:', getData);
        }
    } catch (error) {
        console.error('❌ Profile fetch failed:', error.message);
    }

    // 4. Get Profile by User ID (Public)
    try {
        console.log('\n4. Fetching Profile by User ID...');
        const publicRes = await fetch(`${BASE_URL}/profile/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const publicData = await publicRes.json();

        if (!publicRes.ok) throw new Error(publicData.message);

        console.log('✅ Public profile fetch successful.');
    } catch (error) {
        console.error('❌ Public profile fetch failed:', error.message);
    }
}

verifyProfileSystem();
