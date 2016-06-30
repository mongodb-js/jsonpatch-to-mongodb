var toDot = require('jsonpath-to-dot');

module.exports = function(patches){
  var update = {};
  patches.map(function(p){
    if(p.op === 'add' || p.op === 'replace'){
      if(!update.$set) update.$set = {};
      update.$set[toDot(p.path)] = p.value;
    }
    else if(p.op === 'remove'){
      if(!update.$unset) update.$unset = {};
      if(!update.$pull) update.$pull = {};
      update.$unset[toDot(p.path)] = 1;
      var pullPath = toDot(p.path).replace(/\.[0-9]*$/, '');
      update.$pull[pullPath] = null;
    }
    else if(p.op !== 'test') {
      throw new Error('Unsupported Operation! op = ' + p.op);
    }
  });
  return update;
};
