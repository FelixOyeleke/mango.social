// Simple script to run the jobs migration
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrationPath = join(__dirname, 'src', 'db', 'migrations', '004_create_jobs_tables.ts');

console.log('Running jobs migration...');
console.log('Migration file:', migrationPath);

const child = spawn('npx', ['tsx', migrationPath], {
  stdio: 'inherit',
  shell: true
});

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Migration completed successfully!');
  } else {
    console.log('\n❌ Migration failed with code:', code);
  }
  process.exit(code);
});

