const mongoose = require('mongoose');
const chalk = require('chalk');
const log = console.log;
const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');

mongoose
  .connect(process.env.DB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    log(chalk.cyanBright(`DB connection successful`));
  });

// testTour
//   .save()
//   .then((doc) => {
//     log(doc);
//   })
//   .catch((err) => log(err));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  log(chalk.blueBright(`Server is running on ${port}`));
});
