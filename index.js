const express = require("express");
require('./services/passport');


// this app object here is used to set up configuration that will listen for incoming requests
const app = express(); // express() generates a new applicaiton that represents a running express app

require("./routes/authRoutes")(app);

const PORT = process.env.PORT || 5000;
app.listen(PORT);

