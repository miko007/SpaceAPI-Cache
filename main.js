"use strict";

require("dotenv").config();

const App = require("./src/App");

new App(process.env.PORT);
