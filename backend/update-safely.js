import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcryptjs';

dotenv.config();

async function fixDB() {
    const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    try {
        await c.query('BEGIN');
        const hash = bcrypt.hashSync('dyuti', 10);
        // Delete the conflicting account
        await c.query("DELETE FROM AuthUser WHERE phone = '9940234094'");
        // Update the official Super Admin
        await c.query("UPDATE AuthUser SET phone = '9940234094', password_hash = $1 WHERE email = 'superadmin@fmt.com'", [hash]);
        await c.query('COMMIT');
        console.log('Super Admin credentials successfully overridden');
    } catch (err) {
        await c.query('ROLLBACK');
        console.error('Data error:', err);
    }
    await c.end();
}
fixDB();
