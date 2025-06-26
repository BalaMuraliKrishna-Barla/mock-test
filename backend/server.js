/* headers */
const express = require("express");
const cors = require("cors");
require("dotenv").config();

/* imports */
const { DB_CONNECT } = require("./config/db");


const app = express();
app.use(express.json());


DB_CONNECT();

const port = 1580;
app.listen(port, () => console.log("server is active"));
