import { Client } from 'pg';
async function test() {
    const passwords = ['Hp', 'Hp123', 'dyuti', 'preflex', 'carepill', 'CarePill', 'family_medicine_tracker', 'postgres123', 'dbpassword'];
    let worked = null;
    for (const pw of passwords) {
        const client = new Client(`postgres://postgres:${pw}@localhost:5432/postgres`);
        try {
            await client.connect();
            await client.query('SELECT 1');
            worked = pw;
            await client.end();
            break;
        } catch (err) { }
    }
    console.log("WORKED_PASSWORD:" + worked);
}
test();
