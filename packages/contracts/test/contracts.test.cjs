const assert = require('node:assert/strict');

async function main() {
  const contracts = await import('../dist/index.js');

  assert.deepEqual(contracts.MediaType, {
    Movie: 0,
    TvSeries: 1,
    Book: 2,
    Manga: 3,
    Game: 4,
  });
  assert.deepEqual(contracts.Status, {
    Ongoing: 0,
    Completed: 1,
    Backlog: 2,
    Dropped: 3,
    CaughtUp: 4,
  });
  assert.deepEqual(Object.keys(contracts).sort(), ['MediaType', 'Status']);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
