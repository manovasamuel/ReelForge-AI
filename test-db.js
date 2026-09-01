const postgres = require('postgres');
async function run() {
  const sql = postgres('postgresql://postgres.eltnaffxnjddbsuqohfs:8MBauit1Qjt8sq76@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres', { ssl: 'require' });
  try {
    const res = await sql\SELECT 1 as result\;
    console.log('SUCCESS:', res[0]);
  } catch(err) {
    console.error('FAILED:', err.message);
  } finally {
    sql.end();
  }
}
run();
