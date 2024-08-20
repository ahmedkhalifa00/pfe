const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const cors = require('cors');
const kidsRoutes = require('./routes/kids');
const gRPCproxyServer = require('./routes/grpcProxyServer');
const KIDORoutes = require('./routes/KIDO');

const app = express();
const port = process.env.PORT || 5000;

connectDB();

app.use(cors());
app.use(express.json({ extended: false }));
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api/auth', require('./routes/auth'));
app.use('/api', kidsRoutes ,gRPCproxyServer,KIDORoutes);


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
