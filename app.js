require("colors");
require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const morgan = require("morgan");

const {
  notFound,
  errorHandler,
} = require("./server/middleware/errorMiddleware");
const connectDB = require("./server/config/db");

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));
app.use(bodyParser.json());
app.use(express.json());
app.use("/temp", express.static("uploads"));

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));
//connect DB
connectDB();
// route configuration
require("./server/routes")(app);
// app.use(notFound);
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(
  PORT,
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.white.bold
  )
);
