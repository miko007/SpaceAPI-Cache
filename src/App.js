"use strict";

const Express = require("express");

const Std       = require("./Std");
const Endpoints = require("./models/Endpoints");
const Validator = require("./Validator");

const Package   = require("../package.json");

class App {
	constructor(port = 9000) {
		this.port      = port;
		this.express   = Express();
		this.endpoints = new Endpoints();
		this.validator = new Validator();

		this.express.use((request, response, next) => {
			response.set("Content-type", "application/json");
			next();
		});

		this.express.get("/", (request, response) => {
			response.send(JSON.stringify(this.endpoints, null, 4));
		});


		this.express.get("/info", (request, response) => {
			response.send(JSON.stringify({
				name    : Package.name,
				version : Package.version
			}, null, 4));
		});

		this.express.get("/:key", (request, response) => {
			if (!this.endpoints.endpoints.hasOwnProperty(request.params.key)) {
				response.statusCode = 404;
				response.send(JSON.stringify({
					error : `endpoint '${request.params.key}' not found in cache`
				}, null, 4));

				return;
			}
			response.send(JSON.stringify(this.endpoints.endpoints[request.params.key], null, 4));
		});

		this.express.get("/:key/valid", (request, response) => {
			let valid;
			if (typeof this.endpoints.endpoints[request.params.key] !== "undefined")
				valid = this.validator.validate(this.endpoints.endpoints[request.params.key].data);
			else
				valid = null;
			if (valid === null) {
				response.statusCode = 505;
				response.send(JSON.stringify({
					error : "data not ready"
				}), null, 4);

				return;
			}

			response.send(JSON.stringify(valid, null, 4));
		});

		this.express.get("/:key/:subkey", (request, response) => {
			if (!this.endpoints.endpoints.hasOwnProperty(request.params.key) ||
				!this.endpoints.endpoints[request.params.key].data.hasOwnProperty(request.params.subkey)) {
				response.statusCode = 404;
				response.send(JSON.stringify({
					error : `attribute '${request.params.subkey}' does not exist on endpoint '${request.params.key}'`
				}, null, 4));

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
