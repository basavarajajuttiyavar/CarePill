import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

async function update() {
    const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    const hash = bcrypt.hashSync('dyuti', 10);
    try {
        const res = await c.query("UPDATE AuthUser SET phone = '9940234094', password_hash = $1 WHERE email = 'superadmin@fmt.com'", [hash]);
        console.log('Update Complete: ' + res.rowCount + ' row(s)');
    } catch (err) {
        console.error('Update Error:', err);
    }
    await c.end();
}
update();
