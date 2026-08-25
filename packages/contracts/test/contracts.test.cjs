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
  assert.equal(contracts.MINIMUM_RATING, 0);
  assert.equal(contracts.MAXIMUM_RATING, 5);
  assert.equal(contracts.RATING_STEP, 0.5);
  assert.equal(contracts.isValidRating(4.5), true);
  assert.equal(contracts.isValidRating(4.25), false);
  assert.equal(contracts.isValidRating(5.5), false);
  assert.deepEqual(Object.keys(contracts).sort(), [
    'MAXIMUM_RATING', 'MINIMUM_RATING', 'MediaType', 'RATING_STEP', 'RATING_VALUES', 'Status', 'isValidRating',
  ]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
