var toDot = require('jsonpath-to-dot');

module.exports = function(patches){
  var update = {};

  patches.map(function(p){
    if(p.op === 'add' || p.op === 'replace'){
      var path = toDot(p.path),
        parts = path.split('.');

      var key = parts[0];
      var $position = parts[1] && parseInt(parts[1], 10);

      update.$set = update.$set || {};

      if (!isNaN($position)) {
        if (update.$set[key]) {
          if (!isNaN(update.$set[key].$position)) {
            $position = update.$set[key].$position;
            delete update.$set[key].$position;
          }

          if (!update.$set[key].$each) {
            update.$set[key] = {
              $each: [
                update.$set[key]
              ]
            };
          }

          update.$set[key].$each.push(p.value);
          update.$set[key].$position = $position;
        } else {
          update.$set[key] = {
            $each: [p.value],
            $position: $position
          };
        }
      } else {
        if (update.$set[key]) {
          if (!update.$set[key].$each) {
            update.$set[key] = {
              $each: [update.$set[key]]
            };
          }
          update.$set[path].$each.push(p.value);
        } else {
          update.$set[path] = p.value;
        }
      }
    }
    else if(p.op === 'remove'){

      var isArray = !p.hasOwnProperty('isArray') ? true : p.isArray;

      if(!update.$unset){
        update.$unset = {};
      }
      update.$unset[toDot(p.path)] = 1;
      if(isArray)
      {
        if(!update.$pull) {
          update.$pull = {};
        }

          var pullPath = toDot(p.path).replace(/\.[0-9]*$/, '');
          update.$pull[pullPath] = null;
      }

    }
    else if(p.op !== 'test') {
      throw new Error('Unsupported Operation! op = ' + p.op);
    }
  });
  return update;
};
