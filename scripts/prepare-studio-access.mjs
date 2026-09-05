import { randomBytes, createHash } from 'node:crypto';
import { localSql } from './local-database.mjs';

const token = randomBytes(32).toString('hex');
const hash = createHash('sha256').update(token).digest('hex');
const results = await localSql(
  `INSERT INTO studio_bootstrap (id,token_hash,expires_at) SELECT 'owner','${hash}',${Date.now() + 3600000} WHERE NOT EXISTS (SELECT 1 FROM studio_accounts) ON CONFLICT(id) DO UPDATE SET token_hash=excluded.token_hash,expires_at=excluded.expires_at RETURNING id;`,
);
if (results.some((r) => r.results?.length)) {
  console.log('Defina seu e-mail e sua senha neste link local de uso único:');
  console.log('http://localhost:3000/studio#setup=' + token);
} else
  console.log(
    'O acesso já foi configurado. Entre em http://localhost:3000/studio com seu e-mail e senha.',
  );
