'use strict';

var async    = require('async');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var should   = require('should');

var User = require('../models/user');

describe('Mongoose', function () {
  var user;
  var userContent = {
    firstname: 'Firstname',
    lastname: 'Lastname',
    address: {
      street: '3 rue de l\'Eglise',
      city: 'Paris'
    }
  };
  before(function (done) {
    /**
     * see http://mongoosejs.com/docs/connections.html
     */
    mongoose.connect('localhost:27017/node-examples');
    user = new User(userContent);
    (typeof user._id).should.eql('object');
    async.series([
      function (next) {
        User.remove(next);
      },
      function (next) {
        user.save(next);
      }
    ], function (err, result) {
      (typeof result[1][0]._id).should.eql('object');
      (typeof user._id).should.eql('object');
      done(err);
    });
  });

  after(function (done) {
    User.remove({}, function (err, status/*, status no more */) {
      should.not.exist(err);
      status.result.ok.should.eql(1);
      status.result.n.should.eql(2);
      mongoose.disconnect();
      done();
    });
  });

  it('create an ObjectId ', function (done) {
    var id = ObjectId.createPk();
    // createPk return an object
    (typeof id).should.eql('object');
    done();
  });

  it('findOne with a bad ObjectId', function (done) {
    User.findOne({ _id: 'badObjectId' }, function (err/*, res*/) {
      err.message.should.eql('Cast to ObjectId failed for value "badObjectId" at path "_id"');
      err.name.should.eql('CastError');
      err.kind.should.eql('ObjectId');
      err.value.should.eql('badObjectId');
      err.path.should.eql('_id');
      done();
    });
  });

  it('findOne with a wrong ObjectId', function (done) {
    User.findOne({ _id: ObjectId.createPk() }, function (err, res) {
      should.not.exist(err);
      should.not.exist(res);/* res === null */
      done();
    });
  });

  it('find with a wrong ObjectId', function (done) {
    User.find({ _id: ObjectId.createPk() }, function (err, res) {
      should.not.exist(err);
      res.should.eql([]);
      done();
    });
  });

  it('findOne', function (done) {
    User.findOne({ _id: user._id }, function (err, res) {
      should.not.exist(err);
      res.firstname.should.eql(userContent.firstname);
      res.lastname.should.eql(userContent.lastname);
      res.address.city.should.eql(userContent.address.city);
      res.address.street.should.eql(userContent.address.street);
      done();
    });
  });

  it('findOne - with a string instead of a ObjectId => it works !', function (done) {
    User.findOne({ _id: user._id.toString() }, function (err, res) {
      should.not.exist(err);
      res.firstname.should.eql(userContent.firstname);
      res.lastname.should.eql(userContent.lastname);
      done();
    });
  });

  it('save', function (done) {
    var user = new User(userContent);
    user.save(function (err, res, nbSaved) {
      should.not.exist(err);
      // console.log(typeof res._id); // object
      nbSaved.should.eql(1);
      done();
    });
  });

  it('save a user with a specific _id', function (done) {
    userContent._id = ObjectId.createPk();
    var user = new User(userContent);
    user.save(function (err, res/*, nbSaved*/) {
      should.not.exist(err);
      res._id.should.eql(userContent._id);
      done();
    });
  });

  it('update', function (done) {
    User.update({ _id: user._id },
                { firstname: 'newFirstname' },
                function (err, status /*, no more status here */ ) {
      should.not.exist(err);
      status.n.should.eql(1);
      status.ok.should.eql(1);
      done();
    });
  });

  it('count', function (done) {
    User.count({}, function (err, count, param /* undefined */) {
      should.not.exist(err);
      count.should.eql(3);
      should.not.exist(param);
      done();
    });
  });

  it('stream', function (done) {
    var stream = User.find().stream();
    var count = 0;
    stream.on('data', function (/*doc*/) {
      count++;
    });

    stream.on('error', function (err) {
      should.not.exist(err);
    });

    stream.on('close', function () {
      count.should.eql(3);
      done();
    });
  });

  it('remove', function (done) {
    user.remove(function (err, res) {
      should.not.exist(err);
      res.firstname.should.eql(user.firstname);
      res.lastname.should.eql(user.lastname);
      res._id.should.eql(user._id);
      done();
    });
  });

});
