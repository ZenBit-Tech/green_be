import Database from 'better-sqlite3';

const db = new Database('lab_ai_dev.sqlite', { readonly: true });

console.log('📊 Database Info:\n');

console.log('📋 Tables:');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
tables.forEach(t => console.log(`  - ${t.name}`));

console.log('\n👥 Users:');
try {
  const users = db.prepare('SELECT id, email, provider, provider_id, first_name, last_name FROM users').all();
  if (users.length === 0) {
    console.log('  (empty)');
  } else {
    console.table(users);
  }
} catch (err) {
  console.log('  ⚠️ Error:', err.message);
}

db.close();
console.log('\n✅ Done');