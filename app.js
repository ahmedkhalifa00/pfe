const express = require('express');
const mongoose = require('mongoose');
const config = require('./config');
const kidsRoutes = require('./routes/kids');

const app = express();
const port = process.env.PORT || 5000;

bodyParser = require('body-parser').json();

mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use(express.json());
app.use('/api', kidsRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
