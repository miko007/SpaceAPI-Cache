"use strict";

const fetch         = require("node-fetch");
const JSONValidator = require("jsonschema").Validator;
const Ajv           = require("ajv");

const Std    = require("./Std");

class Validator {
	constructor() {
		this.validator = {
			12 : new Ajv().compile(Validator.Versions["12"]),
			13 : new Ajv().compile(Validator.Versions["13"])
		};
	}

	validate(spaceAPIObject) {
		let validator;

		if (!spaceAPIObject.hasOwnProperty("api"))
			return null;
		switch (spaceAPIObject.api) {
			case "0.12":
				validator = this.validator["12"];
				break;
			case "0.13":
				validator = this.validator["13"];
		}

		return {
			valid   : validator(spaceAPIObject),
			version : spaceAPIObject.api,
			errors  : validator.errors
		};
	}
}
Validator.Versions = {
	12 : require("../schemas/v0.12"),
	13 : require("../schemas/v0.13")
};

module.exports = Validator;
