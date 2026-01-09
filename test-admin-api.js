// Test admin API endpoints
import axios from 'axios';

const API_URL = 'http://localhost:5000';

async function testAdminAPI() {
  try {
    console.log('🔍 Testing Admin API...\n');
    
    // Step 1: Login as test user
    console.log('1. Logging in as test@test.com...');
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@test.com',
      password: 'password123'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login failed!');
      console.log('Response:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    const user = loginResponse.data.data.user;
    
    console.log('✅ Login successful!');
    console.log(`   User: ${user.full_name}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Token: ${token.substring(0, 20)}...\n`);
    
    // Step 2: Test dashboard stats endpoint
    console.log('2. Fetching dashboard stats...');
    const statsResponse = await axios.get(`${API_URL}/api/admin/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!statsResponse.data.success) {
      console.log('❌ Failed to fetch stats!');
      console.log('Response:', statsResponse.data);
      return;
    }
    
    console.log('✅ Dashboard stats fetched successfully!');
    console.log('   Stats:', JSON.stringify(statsResponse.data.data.stats, null, 2));
    console.log(`   Top Contributors: ${statsResponse.data.data.topContributors.length}\n`);
    
    // Step 3: Test users endpoint
    console.log('3. Fetching users list...');
    const usersResponse = await axios.get(`${API_URL}/api/admin/users?page=1&limit=20`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (!usersResponse.data.success) {
      console.log('❌ Failed to fetch users!');
      console.log('Response:', usersResponse.data);
      return;
    }
    
    console.log('✅ Users fetched successfully!');
    console.log(`   Total users: ${usersResponse.data.data.users.length}`);
    console.log(`   Pagination:`, usersResponse.data.data.pagination);
    console.log('\n   Users:');
    usersResponse.data.data.users.forEach((u, i) => {
      console.log(`   ${i + 1}. ${u.full_name} (${u.email}) - ${u.role}`);
    });
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
    }
  }
}

testAdminAPI();

