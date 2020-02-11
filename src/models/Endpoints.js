"use strict";

const fetch    = require("node-fetch");
const slugify  = require("slugify");

const Model    = require("./Model");
const Endpoint = require("./Endpoint");
const Package  = require("../../package.json");
const Std      = require("../Std");

class Endpoints extends Model {
	constructor() {
		super();
		this.updates       = 0;
		this.endpointsKeys = {};
		this.endpoints     = {};
		this.intervals     = {
			urls      : Std.SetIntervalImmediate(() => this.fetchEndpoints(), 1 * Std.Time.DAYS),
			endpoints : Std.SetIntervalImmediate(() => this.refresh(), 1 * Std.Time.MINUTES),
			refresh   : setInterval(() => this.refresh(), 1 * Std.Time.MINUTES)
		};
	}

	fetchEndpoints() {
		Std.Log(`[Endpoints] fetching directory`, Std.LogLevel.INFO);
		fetch(Package.directoryURL)
			.then(response => response.json())
			.then(json => {
				const endpoints = {};
				for (const [key, url] of Object.entries(json)) {
					fetch(url)
						.then(response => response.json())
						.then(json => {
							const endpoint = new Endpoint(url);
							this.endpointsKeys[key] = `/${slugify(key)}`;
							if (json.hasOwnProperty("cache") && json.cache.hasOwnProperty("schedule"))
								endpoint.setTTL(json.cache.schedule);
							endpoint.data = json;
							this.endpoints[slugify(key)] = endpoint;
						})
						.catch(error => {
							Std.Log(`[Enpoints] WARNING fetching '${url}': ${error}`, Std.LogLevel.WARN);
							delete endpoints[key];
						});
				}
				this.endpoints = endpoints;
			}).catch(error => {
				Std.Log(`[Endpoints] ERROR fetching endpoints: ${error}`, Std.LogLevel.ERROR);
			});
	}

	refresh() {
		Std.Log(`[Endpoints] refreshing endpoints`, Std.LogLevel.INFO);
		for (let [key, endpoint] of Object.entries(this.endpoints)) {
			if (endpoint === null)
				continue;
			if (endpoint.ttl !== null && this.updates % endpoint.ttl !== 0)
				continue;
			else if (endpoint.ttl === null && this.updates % 5 * Std.Time.MINUTES !== 0)
				continue;
			endpoint.fetch();
		}

		if ((this.updates += 1 * Std.Time.MINUTES) >= Number.MAX_VALUE)
			this.updates = 0;
	}

	toJSON() {
		return Object.keys(this.endpointsKeys).sort().reduce((r, k) => (r[k] = this.endpointsKeys[k], r), {});
	}
}

module.exports = Endpoints;
