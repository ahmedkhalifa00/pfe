const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Kid = require('./models/Kids');
const PROTO_PATH = './protos/location.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const proto = grpc.loadPackageDefinition(packageDefinition).tracker;

const server = new grpc.Server();

server.addService(proto.LocationService.service, {
  UpdateLocation: (call, callback) => {
    const { kidId, latitude, longitude, timestamp } = call.request;
    Kid.findById(kidId, (err, kid) => {
      if (err || !kid) {
        return callback(err || new Error('Kid not found'));
      }
      kid.location = { latitude, longitude, timestamp: new Date(timestamp) };
      kid.save((err, updatedKid) => {
        if (err) return callback(err);
        callback(null, {});
      });
    });
  },
  GetLocation: (call) => {
    call.on('data', (kidId) => {
      Kid.findById(kidId.id, (err, kid) => {
        if (err || !kid) {
          call.write({});
        } else {
          call.write({
            kidId: kid.id,
            latitude: kid.location.latitude,
            longitude: kid.location.longitude,
            timestamp: kid.location.timestamp.getTime()
          });
        }
      });
    });
  }
});

server.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
  server.start();
});
