"use strict";

const fetch = require("node-fetch");

const Model = require("./Model");
const Std   = require("../Std");

class Endpoint extends Model {
	constructor(url) {
		super();
		this.url  = url;
		this.ttl  = null;
		this.data = null;
	}

	setTTL(ttlString) {
		if (!ttlString.match(/^[mhd]\.[0-9]{2}$/))
			return;
		const pair       = ttlString.split('.');
		const unit       = pair[0];
		const multiplier = parseInt(pair[1]);
		let   time       = 0;

		switch (unit) {
			case "m":
				time = Std.Time.MINUTES;
				break;
			case "h":
				time = Std.Time.HOURS;
				break;
			case "d":
				time = Std.Time.DAYS;
				break;
		}

		this.ttl = multiplier * time;
	}

	fetch() {
		fetch(this.url)
			.then(response => response.json())
			.then(json => {
				this.data = json;
				if (json.hasOwnProperty("cache") && json.cache.hasOwnProperty("schedule"))
					this.setTTL(json.cache.schedule);
			})
			.catch(error => {
				Std.Log(`[Endpoint] ERROR fetching endpoint '${this.url}': ${error}`, Std.LogLevel.ERROR);
			});
	}

	toJSON() {
		return this.data;
	}

}

module.exports = Endpoint;
