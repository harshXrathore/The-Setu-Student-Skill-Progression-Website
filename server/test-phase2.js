const API_URL = 'http://localhost:3000/api';

async function testJobsAndCommunity() {
    try {
        console.log("--- Testing Jobs ---");
        const jobsRes = await fetch(`${API_URL}/jobs`);
        if (!jobsRes.ok) throw new Error("Jobs fetch failed");
        const jobs = await jobsRes.json();
        console.log(`Jobs found: ${jobs.length}`);

        console.log("--- Testing Community ---");
        const postsRes = await fetch(`${API_URL}/community/posts`);
        if (!postsRes.ok) throw new Error("Posts fetch failed");
        const posts = await postsRes.json();
        console.log(`Posts found: ${posts.length}`);

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

testJobsAndCommunity();
