import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

async function check() {
    const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    const res = await c.query("SELECT * FROM AuthUser WHERE phone = '9940234094'");
    console.log('Results:', res.rows);
    await c.end();
}
check();
