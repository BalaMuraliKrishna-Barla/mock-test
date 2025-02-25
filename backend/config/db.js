const mongoose = require("mongoose")


let mongoURI = `mongodb://localhost:27017/mocktestDB`
const DB_CONNECT = async () => {
    mongoose
    .connect(mongoURI)
    .then( () => console.log(`DB CONNECTED`))
    .catch( err => console.log(`SERVER ERROR : ${err.message}`))
}

module.exports = { DB_CONNECT };