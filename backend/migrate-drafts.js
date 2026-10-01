import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

async function addDraftTable() {
    const c = new pg.Client({ connectionString: process.env.DATABASE_URL });
    await c.connect();
    try {
        await c.query(`
            CREATE TABLE IF NOT EXISTS MemberDraft (
                draft_id SERIAL PRIMARY KEY,
                auth_user_id INT UNIQUE REFERENCES AuthUser(auth_user_id) ON DELETE CASCADE,
                draft_data JSONB NOT NULL,
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            );
        `);
        console.log('MemberDraft table created successfully.');
    } catch (err) {
        console.error('Migration error:', err);
    }
    await c.end();
}
addDraftTable();
