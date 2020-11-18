const mongoose = require('mongoose');
const chalk = require('chalk');
const log = console.log;
const dotenv = require('dotenv');
dotenv.config();

process.on('uncaughtException', (err) => {
  log(chalk.redBright(`${err.name}: ${err.message}`));
  process.exit(1);
});

const app = require('./app');

mongoose
  .connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    log(chalk.magentaBright(`DB connection successful`));
  });

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  log(chalk.blueBright(`Server is running on ${port}`));
});

process.on('unhandledRejection', (err) => {
  log(chalk.redBright(`${err.name}: ${err.message}`));
  server.close(() => {
    process.exit(1);
  });
});
