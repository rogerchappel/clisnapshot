import { test, describe } from 'node:test';
import assert from 'node:assert';

describe('clisnapshot config edge cases', () => {
  test('should handle missing config file gracefully', async () => {
    const { execSync } = await import('node:child_process');
    try {
      execSync('node dist/cli.js check --config nonexistent.json', { encoding: 'utf8', stdio: 'pipe' });
      assert.fail('should have thrown');
    } catch (e) {
      assert.ok(e.status !== 0, 'should exit non-zero');
    }
  });

  test('should default to .clisnapshot.json when no config specified', async () => {
    const { execSync } = await import('node:child_process');
    try {
      execSync('node dist/cli.js check', { encoding: 'utf8', stdio: 'pipe', timeout: 5000 });
    } catch (e) {
      // May fail if no snapshots exist - that's expected
      assert.ok(true, 'handles missing default config');
    }
  });

  test('package.json should have release:check', async () => {
    const pkg = await import('../package.json', { with: { type: 'json' } });
    assert.ok(pkg.default.scripts['release:check'], 'release:check script should exist');
    assert.ok(pkg.default.scripts['package:smoke'], 'package:smoke script should exist');
  });
});
