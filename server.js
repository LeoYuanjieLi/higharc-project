const express = require('express');
const app = express();

//setting middleware
app.use(express.static(__dirname)); //Serves resources from public folder

const server = app.listen(5000);