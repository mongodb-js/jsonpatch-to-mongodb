var assert = require('assert'),
  toMongodb = require('../');

describe('jsonpatch to mongodb', function() {
  it('should work', function() {
    var patches = [{
      op: 'replace',
      path: '/name',
      value: 'dave'
    }];

    var expected = {
      $set: {
        name: 'dave'
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });
});
