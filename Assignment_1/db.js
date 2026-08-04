const mongoose = require("mongoose");
const url =
  "mongodb+srv://lakshit031:Lakshit031@cluster0.r7muefb.mongodb.net/assignmentDB?appName=Cluster0";
const connectDB = async () => {
  await mongoose.connect(url);
  console.log("database connection established");
};
module.exports = connectDB;
