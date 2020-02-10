"use strict";

const fetch         = require("node-fetch");
const JSONValidator = require("jsonschema").Validator;
const Ajv           = require("ajv");

const Schema = require("../schemas/v0.13");
const Std    = require("./Std");

class Validator {
	constructor() {
		this.schema    = Schema;
		this.validator = new Ajv().compile(this.schema);
		//this.load(13);
	}

	load(version) {
		fetch(Validator.Versions[version])
			.then(response => response.json())
			.then(json => this.schema = json)
			.catch(error => {
				Std.Log(`[Validator] ERROR could not fetch schema version ${version}: ${error}`, Std.LogLevel.ERROR);
			});
	}

	validate(spaceAPIObject) {
		console.log(spaceAPIObject);
		if (this.schema === null)
			throw Error();
		return {
			valid  : this.validator(spaceAPIObject),
			errors : this.validator.errors
		};
	}
}
Validator.Versions = {
	13 : "https://schema.spaceapi.io/13.json"
};

module.exports = Validator;
