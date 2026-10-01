import { pool } from "./src/db.js";

async function testLogs() {
    try {
        // Insert dummy log to act as a Super Admin test
        await pool.query("INSERT INTO ActivityLog (auth_user_id, action, status) VALUES (NULL, 'Approved family request TEST_ID', 'success')");

        // Fetch logs using the exact query from the new /logs API
        const result = await pool.query(
            `SELECT al.activity_log_id, al.action, al.status, al.created_at,
              a.name AS admin_name, a.email
       FROM ActivityLog al
       LEFT JOIN AuthUser a ON a.auth_user_id = al.auth_user_id
       ORDER BY al.created_at DESC LIMIT 1`
        );
        console.log("Log retrieved from DB matching API query format:");
        console.log(result.rows[0]);

        // Fetch stats query to verify the dashboard update works
        const stats = await pool.query(
            `SELECT al.action AS description, al.created_at, al.status
       FROM ActivityLog al
       ORDER BY al.created_at DESC LIMIT 5`
        );
        console.log("Stats output matching Recent Activity dashboard:");
        console.log(stats.rows[0]);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

testLogs();
