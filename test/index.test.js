var assert = require('assert');
var toMongodb = require('../');
var chai = require('chai');

describe('jsonpatch to mongodb', function() {

  it('should work with single add', function() {
    var patches = [{
      op: 'add',
      path: '/name/-',
      value: 'dave'
    }];

    var expected = {
      $push: {
        name: 'dave'
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should allow add to insert or replace a non-array field', function() {
    var patches = [{
      op: 'add',
      path: '/name/nested',
      value: 'dave'
    }];

    var expected = {
      $set: {
        'name.nested': 'dave'
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with escaped characters', function() {
    var patches = [{
      op: 'replace',
      path: '/foo~1bar~0',
      value: 'dave'
    }];

    var expected = {
      $set: {
        "foo/bar~": 'dave'
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with array set', function() {
    var patches = [{
      op: 'add',
      path: '/name/1',
      value: 'dave'
    }];

    var expected = {
      $push: {
        name: {
          $each: [
            'dave'
          ],
          $position: 1
        }
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with multiple set', function() {
    var patches = [{
      op: 'add',
      path: '/name/1',
      value: 'dave'
    }, {
      op: 'add',
      path: '/name/2',
      value: 'bob'
    }, {
      op: 'add',
      path: '/name/2',
      value: 'john'
    }];

    var expected = {
      $push: {
        name: {
          $each: [
            'dave',
            'john',
            'bob'
          ],
          $position: 1
        }
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with multiple adds in reverse position', function() {
    var patches = [{
      op: 'add',
      path: '/name/1',
      value: 'dave'
    },{
      op: 'add',
      path: '/name/1',
      value: 'bob'
    },{
      op: 'add',
      path: '/name/1',
      value: 'john'
    }];

    var expected = {
      $push: {
        name: {$each: ['john', 'bob', 'dave'], $position: 1}
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with multiple adds', function() {
    var patches = [{
      op: 'add',
      path: '/name/-',
      value: 'dave'
    },{
      op: 'add',
      path: '/name/-',
      value: 'bob'
    },{
      op: 'add',
      path: '/name/-',
      value: 'john'
    }];

    var expected = {
      $push: {
        name: {$each: ['dave', 'bob', 'john']}
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with multiple adds with some null at the end', function() {
    var patches = [{
      op: 'add',
      path: '/name/-',
      value: null
    },{
      op: 'add',
      path: '/name/-',
      value: 'bob'
    },{
      op: 'add',
      path: '/name/-',
      value: null
    }];

    var expected = {
      $push: {
        name: {$each: [null, 'bob', null]}
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with multiple adds with some null and position', function() {
    var patches = [{
      op: 'add',
      path: '/name/1',
      value: null
    },{
      op: 'add',
      path: '/name/1',
      value: 'bob'
    },{
      op: 'add',
      path: '/name/1',
      value: null
    }];

    var expected = {
      $push: {
        name: {$each: [null, 'bob', null], $position: 1}
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with remove', function() {
    var patches = [{
      op: 'remove',
      path: '/name',
      value: 'dave'
    }];

    var expected = {
      $unset: {
        name: 1
      }
    };

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('should work with replace', function() {
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

  it('should work with test', function() {
    var patches = [{
      op: 'test',
      path: '/name',
      value: 'dave'
    }];

    var expected = {};

    assert.deepEqual(toMongodb(patches), expected);
  });

  it('blow up on adds with non contiguous positions', function() {
    var patches = [{
      op: 'add',
      path: '/name/1',
      value: 'bob'
    },{
      op: 'add',
      path: '/name/3',
      value: 'john'
    }];

    chai.expect(function(){toMongodb(patches)}).to.throw("Unsupported Operation! can use add op only with contiguous positions");
  });

  it('blow up on adds with mixed position 1', function() {
    var patches = [{
      op: 'add',
      path: '/name/1',
      value: 'bob'
    },{
      op: 'add',
      path: '/name/-',
      value: 'john'
    }];

    chai.expect(function(){toMongodb(patches)}).to.throw("Unsupported Operation! can't use add op with mixed positions");
  });

  it('blow up on adds with mixed position 2', function() {
    var patches = [{
      op: 'add',
      path: '/name/-',
      value: 'bob'
    },{
      op: 'add',
      path: '/name/1',
      value: 'john'
    }];

    chai.expect(function(){toMongodb(patches)}).to.throw("Unsupported Operation! can't use add op with mixed positions");
  });

  it('should blow up on move', function() {
    var patches = [{
      op: 'move',
      path: '/name',
      from: '/old_name'
    }];

    chai.expect(function(){toMongodb(patches)}).to.throw('Unsupported Operation! op = move');
  });


  it('should blow up on copy', function() {
    var patches = [{
      op: 'copy',
      path: '/name',
      from: '/old_name'
    }];

    chai.expect(function(){toMongodb(patches)}).to.throw('Unsupported Operation! op = copy');
  });
});

