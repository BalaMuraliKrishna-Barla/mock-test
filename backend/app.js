const express = require("express")
const cors = require("cors")
require("dotenv").config();
const fileRoutes = require("./routes/fileRoutes");

const app = express();
app.use(express.json());
app.use(cors())


app.use("/api/files", fileRoutes);


module.exports = { app };