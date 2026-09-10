import assert from 'node:assert/strict';

export class TestRunner {
  constructor() {
    this.suites = [];
    this.currentSuite = null;
    this.results = [];
    this.tierSummaries = {
      'Tier 1': { total: 0, passed: 0, failed: 0 },
      'Tier 2': { total: 0, passed: 0, failed: 0 },
      'Tier 3': { total: 0, passed: 0, failed: 0 },
      'Tier 4': { total: 0, passed: 0, failed: 0 },
    };
  }

  describe(name, fn, meta = {}) {
    const suite = {
      name,
      meta,
      tests: [],
      beforeAllFns: [],
      afterAllFns: [],
      beforeEachFns: [],
      afterEachFns: [],
    };
    this.suites.push(suite);
    const prevSuite = this.currentSuite;
    this.currentSuite = suite;
    fn();
    this.currentSuite = prevSuite;
  }

  beforeAll(fn) {
    if (this.currentSuite) this.currentSuite.beforeAllFns.push(fn);
  }

  afterAll(fn) {
    if (this.currentSuite) this.currentSuite.afterAllFns.push(fn);
  }

  beforeEach(fn) {
    if (this.currentSuite) this.currentSuite.beforeEachFns.push(fn);
  }

  afterEach(fn) {
    if (this.currentSuite) this.currentSuite.afterEachFns.push(fn);
  }

  test(name, fn, meta = {}) {
    if (!this.currentSuite) {
      this.describe('Default Suite', () => {
        this.test(name, fn, meta);
      });
      return;
    }
    this.currentSuite.tests.push({ name, fn, meta });
  }

  async run() {
    const startTime = Date.now();
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;

    console.log('\n===============================================================');
    console.log('       PulseOS Opaque-Box End-to-End (E2E) Test Suite');
    console.log('       SLIIT SE2030 (Batch 02, Group 60) - Quality Engineering');
    console.log('===============================================================\n');

    for (const suite of this.suites) {
      console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suite.name}\x1b[0m`);

      // Run beforeAll
      for (const beforeAllFn of suite.beforeAllFns) {
        try {
          await beforeAllFn();
        } catch (err) {
          console.error(`  \x1b[31m[beforeAll failed]: ${err.message}\x1b[0m`);
        }
      }

      for (const t of suite.tests) {
        totalTests++;
        const testTier = t.meta.tier || suite.meta.tier || 'Tier 1';
        if (!this.tierSummaries[testTier]) {
          this.tierSummaries[testTier] = { total: 0, passed: 0, failed: 0 };
        }
        this.tierSummaries[testTier].total++;

        // Run beforeEach
        for (const beforeEachFn of suite.beforeEachFns) {
          try {
            await beforeEachFn();
          } catch (err) {
            console.error(`  \x1b[31m[beforeEach failed]: ${err.message}\x1b[0m`);
          }
        }

        const tStart = Date.now();
        let pass = false;
        let error = null;

        try {
          await t.fn();
          pass = true;
          passedTests++;
          this.tierSummaries[testTier].passed++;
          const duration = Date.now() - tStart;
          console.log(`  \x1b[32m✔ [${t.meta.id || 'PASS'}] ${t.name}\x1b[0m \x1b[90m(${duration}ms)\x1b[0m`);
        } catch (err) {
          pass = false;
          failedTests++;
          this.tierSummaries[testTier].failed++;
          error = err;
          const duration = Date.now() - tStart;
          console.log(`  \x1b[31m✖ [${t.meta.id || 'FAIL'}] ${t.name}\x1b[0m \x1b[90m(${duration}ms)\x1b[0m`);
          console.log(`    \x1b[31mError: ${err.message}\x1b[0m`);
          if (err.stack) {
            const stackLines = err.stack.split('\n').slice(1, 3).join('\n    ');
            console.log(`    \x1b[90m${stackLines}\x1b[0m`);
          }
        }

        this.results.push({
          id: t.meta.id || `T-${totalTests}`,
          tier: testTier,
          module: t.meta.module || suite.meta.module || 'Core',
          name: t.name,
          passed: pass,
          durationMs: Date.now() - tStart,
          error: error ? error.message : null,
        });

        // Run afterEach
        for (const afterEachFn of suite.afterEachFns) {
          try {
            await afterEachFn();
          } catch (err) {
            console.error(`  \x1b[31m[afterEach failed]: ${err.message}\x1b[0m`);
          }
        }
      }

      // Run afterAll
      for (const afterAllFn of suite.afterAllFns) {
        try {
          await afterAllFn();
        } catch (err) {
          console.error(`  \x1b[31m[afterAll failed]: ${err.message}\x1b[0m`);
        }
      }
    }

    const totalDuration = Date.now() - startTime;
    this.printSummary(totalTests, passedTests, failedTests, totalDuration);

    return {
      total: totalTests,
      passed: passedTests,
      failed: failedTests,
      durationMs: totalDuration,
      results: this.results,
      tierSummaries: this.tierSummaries,
      success: failedTests === 0,
    };
  }

  printSummary(total, passed, failed, duration) {
    console.log('\n===============================================================');
    console.log('                 E2E TEST EXECUTION SUMMARY');
    console.log('===============================================================');
    console.log(' Tier                      Total   Passed   Failed   Status');
    console.log('---------------------------------------------------------------');
    for (const [tier, counts] of Object.entries(this.tierSummaries)) {
      const status = counts.failed === 0 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
      const tierPad = tier.padEnd(25);
      const totalPad = String(counts.total).padStart(6);
      const passedPad = String(counts.passed).padStart(8);
      const failedPad = String(counts.failed).padStart(8);
      console.log(` ${tierPad} ${totalPad} ${passedPad} ${failedPad}     ${status}`);
    }
    console.log('---------------------------------------------------------------');
    const totalStatus = failed === 0 ? '\x1b[1m\x1b[32mALL PASSED\x1b[0m' : '\x1b[1m\x1b[31mFAILURES DETECTED\x1b[0m';
    console.log(` TOTAL                     ${String(total).padStart(6)} ${String(passed).padStart(8)} ${String(failed).padStart(8)}     ${totalStatus}`);
    console.log(` Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('===============================================================\n');
  }
}

export const runner = new TestRunner();
export const describe = (name, fn, meta) => runner.describe(name, fn, meta);
export const test = (name, fn, meta) => runner.test(name, fn, meta);
export const beforeAll = (fn) => runner.beforeAll(fn);
export const afterAll = (fn) => runner.afterAll(fn);
export const beforeEach = (fn) => runner.beforeEach(fn);
export const afterEach = (fn) => runner.afterEach(fn);
export { assert };
