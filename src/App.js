"use strict";

const Express = require("express");

const Std       = require("./Std");
const Endpoints = require("./models/Endpoints");

class App {
	constructor(port = 9000) {
		this.port      = port;
		this.express   = Express();
		this.endpoints = new Endpoints();

		this.express.get("/", (request, response) => {
			response.set("Content-type", "application/json");
			response.send(JSON.stringify(this.endpoints, null, 4));
		});

		this.express.get("/:key", (request, response) => {
			response.set("Content-type", "application/json");
			if (!this.endpoints.endpoints.hasOwnProperty(request.params.key)) {
				response.statusCode = 404;
				response.send("{}");

				return;
			}
			response.send(JSON.stringify(this.endpoints.endpoints[request.params.key], null, 4));
		});

		this.express.get("/:key/:subkey", (request, response) => {
			response.set("Content-type", "application/json");
			if (!this.endpoints.endpoints.hasOwnProperty(request.params.key) ||
				!this.endpoints.endpoints[request.params.key].data.hasOwnProperty(request.params.subkey)) {
				response.statusCode = 404;
				response.send("{}");

				return;
			}
			response.statusCode = 200;
			response.send(JSON.stringify(this.endpoints.endpoints[request.params.key].data[request.params.subkey], null, 4));
		});

		this.express.listen(this.port).on("error", error => {
			switch (error.code) {
				case "EADDRINUSE":
					Std.Log(`[App] ERROR selected port '${this.port}' is already in use.`, Std.LogLevel.FATAL);
					break;
				default:
					Std.Log(`[App] ERROR could not start server: ${error}`, Std.LogLevel.FATAL);
					break;
			}
		});
	}
}

module.exports = App;
