var toDot = require('jsonpath-to-dot');

module.exports = function(patches){
  var update = {};
  patches.map(function(p){
    switch(p.op) {
    case 'add':
      var path = toDot(p.path),
        parts = path.split('.');

      var positionPart = parts.length > 1 && parts[parts.length - 1];
      var addToEnd = positionPart === '-';
      var key = parts.slice(0, -1).join('.');
      var $position = positionPart && parseInt(positionPart, 10) || null;

      update.$push = update.$push || {};

      if ($position !== null) {
        if (update.$push[key] === undefined) {
          update.$push[key] = {
            $each: [p.value],
            $position: $position
          };
        } else {
          if (update.$push[key] === null || update.$push[key].$position === undefined) {
            throw new Error("Unsupported Operation! can't use add op with mixed positions");
          }
          var posDiff = $position - update.$push[key].$position;
          if (posDiff > update.$push[key].$each.length) {
            throw new Error("Unsupported Operation! can use add op only with contiguous positions");
          }
          update.$push[key].$each.splice(posDiff, 0, p.value);
          update.$push[key].$position = Math.min($position, update.$push[key].$position);
        }
      } else if(addToEnd) {
        if (update.$push[key] === undefined) {
          update.$push[key] = p.value;
        } else {
          if (update.$push[key] === null || update.$push[key].$each === undefined) {
            update.$push[key] = {
              $each: [update.$push[key]]
            };
          }
          if (update.$push[key].$position !== undefined) {
            throw new Error("Unsupported Operation! can't use add op with mixed positions");
          }
          update.$push[key].$each.push(p.value);
        }
      } else {
        throw new Error("Unsupported Operation! can't use add op without position");
      }
      break;
    case 'remove':
      update.$unset = update.$unset || {};
      update.$unset[toDot(p.path)] = 1;
      break;
    case 'replace':
      update.$set = update.$set || {};
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
