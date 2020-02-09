"use strict";

const Chalk = require("chalk");

/**
 * Provides a standard library for often used functions
 *
 * @STATIC
 * @since 0.0.1
 * @author Michael Ochmann <ochmannm@hochschule-trier.de>
 */
class Std {

	static Log(message, level) {
		level = level || Std.LogLevel.NORMAL;
		let date   = new Date();
		let render = null;

		switch (level) {
			case Std.LogLevel.ERROR:
			case Std.LogLevel.FATAL:
				render = Chalk.red;
				break;
			case Std.LogLevel.INFO:
				render = Chalk.blue;
				break;
			case Std.LogLevel.SUCCESS:
				render = Chalk.green;
				break;
			case Std.LogLevel.WARN:
				render = Chalk.yellow;
				break;
			case Std.LogLevel.NORMAL:
			default:
				render = Chalk.grey;
				break;
		}
		console.log(render(`${date.toDateString()} ${date.toLocaleTimeString()}\t${message}`));

		if (level === Std.LogLevel.FATAL)
			process.exit(1);
	}

	static Rand(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}

	static UcFirst(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	static SetIntervalImmediate(handler, timeout, ...args) {
		handler();
		return setInterval(handler, timeout, args);
	}
}

Std.LogLevel = {
	NORMAL  : 0,
	INFO    : 1,
	ERROR   : 2,
	SUCCESS : 3,
	WARN    : 4,
	FATAL   : 5,
};

Std.Time = {
	SECONDS : 1000,
	MINUTES : 60 * 1000,
	HOURS   : 60 * 60 * 1000,
	DAYS    : 24 * 60 * 60 * 1000
};

module.exports = Std;
