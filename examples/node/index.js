var mongoose = require('mongoose');
var jiff = require('jiff');
var async = require('async');
var patchesToMongo = require('../..');

mongoose.set('debug', true);

// Models
var Pet = mongoose.model('Pet', {
  _id: Number,
  name: String,
  type: String,
  type_2: String
}, 'pets');


function getPet(id, callback){
  Pet.findOne({_id: id}, function(err, pet){
    if(err) return callback(err);
    callback(null, pet.toJSON());
  });
};

function updatePet(id, from, to){
  return function(done){
    console.log('update  pet');
    var body = jiff.diff(from, to); //).replace(/"/g, '\\"');
    console.log(body);
    getPet(id, function(err, pet){
      var patched = jiff.patch(body, pet);
      var update = patchesToMongo(body);
      Pet.update({_id: id}, update, function(err){
        console.log(err || patched);
        done()
      });
    });
  };
}

function createPet(body){
  return function(done) {
    console.log('create  pet');
    var pet = new Pet(body);
    pet.save(function (err) {
      console.log(err || pet);
      done()
    });
  }
}

function listPets(callback){
  console.log('list pets');
  Pet.find(function(err, pet){
    console.log(err || pet);
    callback()
  });
}

// Bin
mongoose.connect('mongodb://localhost/test');

function cleanup(done){
  Pet.remove({}, function(err) {
     console.log('Pet collection removed');
    done(err);
  });
}

function setup(done) {
  console.log('# Create the pets');
  async.series([
    createPet({_id: 1, type: 'dog'}),
    createPet({_id: 2, type: 'cat'}),
    createPet({_id: 3, type: 'seabeast'})
  ], function(err, result){
    done(err);
  });

}

function update(done) {
  console.log('# Use json patches to name them');
  async.series([
    updatePet(1, {type: 'dog'}, {name: 'Arlo', type: 'dog'}),
    updatePet(2, {type: 'cat'}, {name: 'Basil', type: 'cat'}),
    updatePet(3, {type: 'seabeast'}, {name: 'Kochka', type: 'cat'}),
    updatePet(3, {type: 'seabeast'}, {name: 'Kochka', type2: 'seabeast'})
  ], function(err, result){
    done(err);
  });
}

async.series([listPets, cleanup, listPets, setup, listPets, update, listPets],
  function(err, result){
    console.log('all done');
    mongoose.connection.close();
  });

