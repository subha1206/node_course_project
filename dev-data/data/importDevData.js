const mongoose = require('mongoose');
const fs = require('fs');

const chalk = require('chalk');
const log = console.log;
const dotenv = require('dotenv');
dotenv.config();

const Tour = require('../../models/tourModel');

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

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Tour.create(tours);
      console.log('data succssfully updated');
      process.exit();
  } catch (error) {
    console.error(error);
  }
};

const deleteAllData = async () => {
  try {
    await Tour.deleteMany();
    console.log('data deleted sucessfully');
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
}
if (process.argv[2] === '--delete') {
  deleteAllData();
}

console.log(process.argv);
