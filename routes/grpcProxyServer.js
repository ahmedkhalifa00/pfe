const express = require('express');
const router = express.Router();
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const PROTO_PATH_LOCATION = './protos/location.proto';
const PROTO_PATH_CHAT = './protos/chat.proto';

// Load proto files
const packageDefinitionLocation = protoLoader.loadSync(PROTO_PATH_LOCATION, {});
const packageDefinitionChat = protoLoader.loadSync(PROTO_PATH_CHAT, {});
const protoLocation = grpc.loadPackageDefinition(packageDefinitionLocation).tracker;
const protoChat = grpc.loadPackageDefinition(packageDefinitionChat).chat;

// Create gRPC clients
const locationClient = new protoLocation.LocationService('127.0.0.1:50051', grpc.credentials.createInsecure());
const chatClient = new protoChat.ChatService('127.0.0.1:50051', grpc.credentials.createInsecure());


// Route to update location
router.post('/update-location', (req, res) => {
  const { kidId, latitude, longitude, timestamp } = req.body;

  // Format the timestamp to ISO 8601
  const formattedTimestamp = new Date(timestamp).toISOString();

  locationClient.UpdateLocation({ kidId, latitude, longitude, timestamp: formattedTimestamp }, (err, response) => {
    if (err) {
      console.error('Error calling gRPC service:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

// Route to update home location
router.post('/update-home-location', (req, res) => {
  const { kidId, latitude, longitude, radius } = req.body;

  locationClient.UpdateHomeLocation({ kidId, latitude, longitude, radius }, (err, response) => {
    if (err) {
      console.error('Error calling gRPC service:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

// Route to send a chat message
router.post('/send-message', (req, res) => {
  const { userId, text, timestamp } = req.body;

  chatClient.SendMessage({ userId, text, timestamp }, (err, response) => {
    if (err) {
      console.error('Error sending chat message:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

// Route to receive chat messages
router.post('/receive-messages', (req, res) => {
  const { userId } = req.body;
  const call = chatClient.ReceiveMessages({ userId });

  let messages = [];
  call.on('data', (message) => {
    messages.push(message);
  });

  call.on('end', () => {
    res.json({ messages });
  });

  call.on('error', (err) => {
    console.error('Error receiving chat messages:', err);
    res.status(500).json({ error: err.message });
  });
});

router.post('/start-mic-listening', (req, res) => {
  const { kidId } = req.body;
  locationClient.StartMicListening({ kidId }, (err, response) => {
    if (err) {
      console.error('Error calling gRPC service:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

router.post('/stop-mic-listening', (req, res) => {
  const { kidId } = req.body;
  locationClient.StopMicListening({ kidId }, (err, response) => {
    if (err) {
      console.error('Error calling gRPC service:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

router.post('/start-volume-notification', (req, res) => {
  const { kidId } = req.body;
  locationClient.StartVolumeNotification({ kidId }, (err, response) => {
    if (err) {
      console.error('Error calling gRPC service:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

router.post('/stop-volume-notification', (req, res) => {
  const { kidId } = req.body;
  locationClient.StopVolumeNotification({ kidId }, (err, response) => {
    if (err) {
      console.error('Error calling gRPC service:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(response);
  });
});

module.exports = router;
