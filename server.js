const mongoose = require('mongoose');
const dotenv = require('dotenv');

//error happen in synchronous way which is uncaught by express
process.on('uncaughtException', (err) => {
  console.log('Uncaught Exception shutting down.....');
  console.log(`${err.name} = ${err.message}`);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');


const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`App is running on port ${port}...`);
});

// if unhandledRejection error occurs then PROCESS object emit unhandledRejection object
//promise
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION shutting down.....');
  console.log(`${err.name} = ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});



