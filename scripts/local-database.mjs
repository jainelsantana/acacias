import { mkdir, writeFile, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';

export async function localSql(sql) {
  await mkdir('artifacts/auth', { recursive: true });
  const file = `artifacts/auth/query-${randomUUID()}.sql`;
  try {
    await writeFile(file, sql);
    const result = spawnSync(
      process.execPath,
      [
        'node_modules/wrangler/bin/wrangler.js',
        'd1',
        'execute',
        'DB',
        '--local',
        '--config',
        existsSync('wrangler.local.json')
          ? 'wrangler.local.json'
          : 'wrangler.local.example.json',
        '--file',
        file,
        '--json',
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: {
          ...process.env,
          WRANGLER_SEND_METRICS: 'false',
          WRANGLER_WRITE_LOGS: 'false',
        },
      },
    );
    if (result.status !== 0)
      throw new Error('Falha no banco local: ' + result.stderr);
    return JSON.parse(result.stdout);
  } finally {
    await unlink(file).catch(() => {});
  }
}
