var toDot = require('jsonpath-to-dot');

module.exports = function(patches){
  var update = {};
  patches.map(function(p){
    if(p.op === 'add'){
      if(!update.$push) update.$push = {};
      update.$push[toDot(p.path)] = p.value;
    }
    else if(p.op === 'remove'){
      if(!update.$unset) update.$unset = {};
      update.$unset[toDot(p.path)] = 1;
    }
    else if(p.op === 'replace'){
      if(!update.$set) update.$set = {};
      update.$set[toDot(p.path)] = p.value;
    }
  });
  return update;
};
