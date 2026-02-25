const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
    'https://vfqwglgfazgvlsycodsv.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmcXdnbGdmYXpndmxzeWNvZHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjUzNTMsImV4cCI6MjA4NzQ0MTM1M30.qvws_w2tQPicdq56qpEeq6aqO16J8pEKEsj4_vT9Gi8'
);

async function testSignup() {
    const { data, error } = await supabase.auth.signUp({
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        options: {
            data: {
                full_name: 'Test Setup User'
            }
        }
    });
    console.log('Result:', data, error);
}

testSignup();
