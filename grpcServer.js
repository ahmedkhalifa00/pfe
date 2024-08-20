const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const Kid = require('./models/Kids');
const PROTO_PATH_LOCATION = './protos/location.proto';
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Load proto files
const packageDefinitionLocation = protoLoader.loadSync(PROTO_PATH_LOCATION, {});
const protoLocation = grpc.loadPackageDefinition(packageDefinitionLocation).tracker;

// Create gRPC server
const server = new grpc.Server();

// Placeholder for mic listening state and volume notification state
let micListeningState = {};
let volumeNotificationState = {};

server.addService(protoLocation.LocationService.service, {
  UpdateLocation: async (call, callback) => {
    try {
      console.log('Received UpdateLocation request:', call.request);
      const { kidId, latitude, longitude, timestamp } = call.request;
      const kid = await Kid.findById(kidId);
      if (!kid) {
        console.error('Kid not found');
        return callback(new Error('Kid not found'));
      }
      kid.location = { latitude, longitude, timestamp: new Date(timestamp) };
      await kid.save();
      console.log('Location updated for kid:', kidId);
      callback(null, {});
    } catch (err) {
      console.error('Error updating location:', err);
      callback(err);
    }
  },
  GetLocation: (call) => {
    console.log('Received GetLocation request');
    call.on('data', async (kidId) => {
      try {
        const kid = await Kid.findById(kidId.id);
        if (!kid) {
          console.error('Kid not found');
          call.write({});
        } else {
          console.log('Location data sent for kid:', kidId.id);
          call.write({
            kidId: kid.id,
            latitude: kid.location.latitude,
            longitude: kid.location.longitude,
            timestamp: kid.location.timestamp.getTime()
          });
        }
      } catch (err) {
        console.error('Error getting location:', err);
        call.write({});
      }
    });
  },
  UpdateHomeLocation: async (call, callback) => {
    try {
      console.log('Received UpdateHomeLocation request:', call.request);
      const { kidId, latitude, longitude, radius } = call.request;
      const kid = await Kid.findById(kidId);
      if (!kid) {
        console.error('Kid not found');
        return callback(new Error('Kid not found'));
      }
      kid.homeLocation = { latitude, longitude, radius };
      await kid.save();
      console.log('Home location updated for kid:', kidId);
      callback(null, { message: 'Home location updated successfully' });
    } catch (err) {
      console.error('Error updating home location:', err);
      callback(err);
    }
  },

  GetLocationHistory: async (call, callback) => {
    try {
      const { kidId, startDate, endDate } = call.request;
      
      const kid = await Kid.findById(kidId);
      if (!kid) {
        return callback(new Error('Kid not found'));
      }

      // Retrieve the location history
      const locations = kid.locationHistory.filter(location => {
        const locationDate = new Date(location.timestamp);
        return locationDate >= new Date(startDate) && locationDate <= new Date(endDate);
      });

      callback(null, { locations });
    } catch (err) {
      console.error('Error retrieving location history:', err);
      callback(err);
    }
  },
  StartMicListening: (call, callback) => {
    const { kidId } = call.request;
    // Placeholder logic to simulate starting mic listening
    micListeningState[kidId] = true;
    console.log(`Start mic listening for kid: ${kidId}`);
    // Simulate async operation
    setTimeout(() => {
      callback(null, { status: 'Mic listening started' });
    }, 1000);
  },
  StopMicListening: (call, callback) => {
    const { kidId } = call.request;
    // Placeholder logic to simulate stopping mic listening
    micListeningState[kidId] = false;
    console.log(`Stop mic listening for kid: ${kidId}`);
    // Simulate async operation
    setTimeout(() => {
      callback(null, { status: 'Mic listening stopped' });
    }, 1000);
  },
  StartVolumeNotification: (call, callback) => {
    const { kidId } = call.request;
    // Placeholder logic to simulate starting volume notification
    volumeNotificationState[kidId] = true;
    console.log(`Start volume notification for kid: ${kidId}`);
    // Simulate async operation
    setTimeout(() => {
      callback(null, { status: 'Volume notification started' });
    }, 1000);
  },
  StopVolumeNotification: (call, callback) => {
    const { kidId } = call.request;
    // Placeholder logic to simulate stopping volume notification
    volumeNotificationState[kidId] = false;
    console.log(`Stop volume notification for kid: ${kidId}`);
    // Simulate async operation
    setTimeout(() => {
      callback(null, { status: 'Volume notification stopped' });
    }, 1000);
  }
});

// Bind and start server
server.bindAsync('0.0.0.0:50051', grpc.ServerCredentials.createInsecure(), (err, port) => {
  if (err) {
    console.error('Failed to bind server:', err);
    return;
  }
  console.log(`gRPC server running on port ${port}`);
  server.start();
});
