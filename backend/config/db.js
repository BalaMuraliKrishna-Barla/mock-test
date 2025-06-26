const mongoose = require("mongoose")

let mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("MONGO_URI is not defined in environment variables.");
    process.exit(1);
}

const DB_CONNECT = async () => {
    mongoose
    .connect(mongoURI)
    .then( () => console.log(`DB CONNECTED`))
    .catch( err => console.log(`SERVER ERROR : ${err.message}`))
}

module.exports = { DB_CONNECT };