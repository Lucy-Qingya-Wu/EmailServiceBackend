const express = require("express");

// this app object here is used to set up configuration that will listen for incoming requests
const app = express() // express() generates a new applicaiton that represents a running express app


app.get('/', (req, res)=>{
	console.log("req: ", req)
	res.send({message_from_lucy:'Hey, how you doin?'});
})
const PORT = process.env.PORT || 5000;
app.listen(PORT)