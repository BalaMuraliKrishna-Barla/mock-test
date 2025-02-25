let {app} = require("./app");
const { DB_CONNECT } = require("./config/db");


DB_CONNECT();

const port = 1580;
app.listen(port, () => console.log('server is active'))