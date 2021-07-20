import mongoose from 'mongoose';
import constants from '../utilities/constants.js';

const  databaseConnection = () => {
  mongoose
    .connect(constants.mongoConnectionURL, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
    .then(() => {
      console.log("Database Server Connected");
    })
    .catch((err) => {
      console.log("Database Connection Error");
    });
}

export default databaseConnection;
