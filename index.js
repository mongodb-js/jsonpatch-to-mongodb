var toDot = require('jsonpath-to-dot');

module.exports = function(patches){
  var update = {};
  patches.map(function(p){
    switch(p.op) {
    case 'add':
      var path = toDot(p.path),
        parts = path.split('.');

      var key = parts[0];
      var $position = parts[1] && parseInt(parts[1], 10);

      update.$push = update.$push || {};

      if (!isNaN($position)) {
        if (update.$push[key]) {
          if (!isNaN(update.$push[key].$position)) {
            $position = update.$push[key].$position;
            delete update.$push[key].$position;
          }

          if (!update.$push[key].$each) {
            update.$push[key] = {
              $each: [
                update.$push[key]
              ]
            };
          }

          update.$push[key].$each.push(p.value);
          update.$push[key].$position = $position;
        } else {
          update.$push[key] = {
            $each: [p.value],
            $position: $position
          };
        }
      } else {
        if (update.$push[key]) {
          if (!update.$push[key].$each) {
            update.$push[key] = {
              $each: [update.$push[key]]
            };
          }
          update.$push[path].$each.push(p.value);
        } else {
          update.$push[path] = p.value;
        }
      }
      break;
    case 'remove':
      if(!update.$unset) update.$unset = {};
      update.$unset[toDot(p.path)] = 1;
      break;
    case 'replace':
      if(!update.$set) update.$set = {};
      update.$set[toDot(p.path)] = p.value;
      break;
    case 'test':
      break;
    default:
      throw new Error('Unsupported Operation! op = ' + p.op);
    }
  });
  return update;
};
