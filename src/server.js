require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const db = require('./config/database');
const routes = require('./routes');
const socketHandler = require('./sockets/messageSocket');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  methods: ['GET', 'POST', 'PATCH', 'DELETE']
}));
app.use(express.json());

app.use('/api', routes);

socketHandler(io);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;


db.authenticate()
  .then(() => {
    console.log('Database connection established successfully.');
    return db.sync();
  })
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Unable to connect to the database:', error);
  }); 