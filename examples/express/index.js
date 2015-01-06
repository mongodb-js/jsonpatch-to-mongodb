var express = require('express'),
  app = module.exports = express(),
  json = require('body-parser').json,
  mongoose = require('mongoose'),
  jiff = require('jiff'),
  patchesToMongo = require('../..');

// Models
var Pet = mongoose.model('Pet', {
  _id: Number,
  name: String,
  type: String
}, 'pets');

// Middleware
var withPet = function(){
  return function(req, res, next){
    req.params._id = parseInt(req.param('_id'), 10);
    req.params.query = {_id: req.param('_id')};

    Pet.findOne(req.param('query'), function(err, pet){
      if(err) return next(err);
      req.pet = pet.toJSON();
      next();
    });
  };
};

// Routes
app.route('/api/v1/pets/:_id')
  .all(withPet())
  .get(function(req, res){
    res.send(req.pet);
  })
  .put(json(), function updatePet(req, res, next){
    var patched = jiff.patch(req.body, req.pet),
      update = patchesToMongo(req.body);
    Pet.update(req.param('query'), update, function(err){
      if(err) return next(err);
      res.status(201).send(patched);
    });
  })
  .delete(function removePet(req, res, next){
    Pet.remove(req.param('query'), function(err){
      if(err) return next(err);
      res.status(200).send(req.pet);
    });
  });

app.route('/api/v1/pets')
  .post(json(), function createPet(req, res, next){
    var pet = new Pet(req.body);
    pet.save(function(err){
      if(err){
        if(err.code === 11000 && err.name === 'MongoError'){
          return res.status(409).send({
            statusCode: 409,
            message: 'Pet with _id `'+req.body._id+'` already exists',
            body: req.body
          });
        }
        return next(err);
      }
      res.status(201).send(pet);
    });
  })
  .get(function listPets(req, res, next){
    Pet.find(function(err, pet){
      if(err) return next(err);
      res.send(pet);
    });
  });

// Bin
mongoose.connect('mongodb://localhost/test');
app.listen(3000, function(){
  var create = function(data){
    var url = 'http://localhost:3000/api/v1/pets';
    var body = JSON.stringify(data).replace(/"/g, '\\"');
    return 'curl -s -X POST -H "Content-Type: application/json" '+url+' -d "' + body + '"  | json -i;';
  };

  var update = function(_id, from, to){
    var url = 'http://localhost:3000/api/v1/pets/' + _id;
    var body = JSON.stringify(jiff.diff(from, to)).replace(/"/g, '\\"');
    return 'curl -s -X PUT -H "Content-Type: application/json" '+url+' -d "' + body + '" | json -i;';
  };
  console.log('# Requirements: you must have curl installed and the json module for pretty formatting:');
  console.log('npm install -g json;');
  console.log();

  console.log('# Create the pets');
  console.log(create({_id: 1, type: 'dog'}));
  console.log(create({_id: 2, type: 'cat'}));
  console.log(create({_id: 3, type: 'seabeast'}));
  console.log();
  console.log('# View them');
  console.log('curl -s -X GET -H "Accept: application/json" http://localhost:3000/api/v1/pets | json -i;');
  console.log();

  console.log('# Use json patches to name them');
  console.log(update(1, {type: 'dog'}, {name: 'Arlo', type: 'dog'}));
  console.log(update(2, {type: 'cat'}, {name: 'Basil', type: 'cat'}));
  console.log(update(3, {type: 'seabeast'}, {name: 'Kochka', type: 'cat'}));
  console.log();

  console.log('# Now view them again:');
  console.log('curl -s -X GET -H "Accept: application/json" http://localhost:3000/api/v1/pets | json -i;');
  console.log();
});

