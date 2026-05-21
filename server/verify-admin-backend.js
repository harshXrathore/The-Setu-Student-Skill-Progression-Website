const API_URL = 'http://localhost:4000/api';
const ADMIN_EMAIL = 'thesetu0@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

async function verifyBackend() {
    console.log("🔍 Starting Admin Backend Verification (using fetch)...\n");

    try {
        // 1. Authentication
        console.log("1️⃣  Testing Authentication...");
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.statusText}`);
        const loginData = await loginRes.json();

        if (!loginData.token) throw new Error("No token received");
        const token = loginData.token;
        console.log("✅ Admin Login Successful");

        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        // 2. Test Audit Logs
        console.log("\n2️⃣  Testing Audit Logs Endpoint...");
        try {
            const logsRes = await fetch(`${API_URL}/admin/audit-logs`, { headers });
            if (!logsRes.ok) throw new Error(logsRes.statusText);
            const logs = await logsRes.json();
            console.log(`✅ Audit Logs Accessed: Retrieved ${logs.length} logs`);
            if (logs.length > 0) {
                console.log(`   Sample: [${logs[0].action}] ${logs[0].details}`);
            }
        } catch (e) {
            console.error("❌ Audit Logs Failed:", e.message);
        }

        // 3. Test System Settings
        console.log("\n3️⃣  Testing System Settings Endpoint...");
        try {
            const settingsRes = await fetch(`${API_URL}/admin/settings`, { headers });
            if (!settingsRes.ok) throw new Error(settingsRes.statusText);
            const settings = await settingsRes.json();
            console.log("✅ Settings Accessed");
            console.log("   Current Config:", JSON.stringify(settings, null, 2));

            // Try updating
            const updateRes = await fetch(`${API_URL}/admin/settings`, {
                method: 'PUT',
                headers,
                body: JSON.stringify({ maintenanceMode: false })
            });
            if (!updateRes.ok) throw new Error(updateRes.statusText);
            console.log("✅ Settings Update works");
        } catch (e) {
            console.error("❌ Settings Failed:", e.message);
        }

        // 4. Test Broadcast Route
        console.log("\n4️⃣  Checking Broadcast Route Existence...");
        try {
            const broadcastRes = await fetch(`${API_URL}/admin/broadcast`, {
                method: 'POST',
                headers,
                body: JSON.stringify({}) // Empty body should fail validation (400)
            });

            if (broadcastRes.status === 400) {
                console.log("✅ Broadcast Route exists and validates input correctly");
            } else {
                throw new Error(`Unexpected status: ${broadcastRes.status}`);
            }
        } catch (e) {
            console.error("❌ Broadcast Route Check Failed:", e.message);
        }

        console.log("\n✨ Verification Complete!");

    } catch (error) {
        console.error("\n❌ Critical Failure:", error.message);
    }
}

verifyBackend();
