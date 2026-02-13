// Using native fetch

// If node-fetch is not available, this script might fail. 
// However, the user environment likely has modern node.
// Let's use a simple http request function to avoid dependencies if possible, 
// OR just assume the user will run this and I can rely on standard fetch in Node 18+.
// I'll try to use standard native fetch (Node 18+).

const BASE_URL = 'http://localhost:3000/api';

async function testBackend() {
    console.log('Testing Backend...');

    // 1. Signup
    const email = `test${Date.now()}@example.com`;
    console.log(`\n1. Testing Signup (${email})...`);
    try {
        const signupRes = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: email,
                password: 'password123'
            })
        });

        const signupData = await signupRes.json();
        if (signupRes.ok) {
            console.log('✅ Signup Successful:', signupData);
        } else {
            console.error('❌ Signup Failed:', signupRes.status, signupData);
            return;
        }

        const userId = signupData.user._id;

        // 2. Login
        console.log('\n2. Testing Login...');
        const loginRes = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        if (loginRes.ok) {
            console.log('✅ Login Successful:', loginData);
        } else {
            console.error('❌ Login Failed:', loginRes.status, loginData);
            return;
        }

        // 3. Create Entry
        console.log('\n3. Testing Create Entry...');
        const entryRes = await fetch(`${BASE_URL}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                content: 'Dear Diary, this is a test entry from the verification script.',
                dateFormatted: new Date().toLocaleString()
            })
        });

        const entryData = await entryRes.json();
        if (entryRes.ok) {
            console.log('✅ Entry Created:', entryData);
        } else {
            console.error('❌ Create Entry Failed:', entryRes.status, entryData);
            return;
        }

        const entryId = entryData._id;

        // 4. Get Entries
        console.log('\n4. Testing Get Entries...');
        const getRes = await fetch(`${BASE_URL}/entries?userId=${userId}`);
        const getData = await getRes.json();

        if (getRes.ok && Array.isArray(getData) && getData.length > 0) {
            console.log(`✅ Get Entries Successful. Found ${getData.length} entries.`);
        } else {
            console.error('❌ Get Entries Failed:', getRes.status, getData);
            return;
        }

        // 5. Delete Entry
        console.log('\n5. Testing Delete Entry...');
        const deleteRes = await fetch(`${BASE_URL}/entries/${entryId}`, {
            method: 'DELETE'
        });

        if (deleteRes.ok) {
            console.log('✅ Delete Entry Successful');
        } else {
            console.error('❌ Delete Entry Failed:', deleteRes.status);
            return;
        }

        console.log('\n✨ All Backend Tests Passed!');

    } catch (error) {
        console.error('❌ a Test Failed:', error.message);
        console.log('Make sure the server is running on port 3000 and MongoDB is active.');
    }
}

testBackend();
