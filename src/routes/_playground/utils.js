// prettier-ignore
import { getRandomHumanReadable, getRandomSentence } from "@marianmeres/random-human-readable";

export const randomTxt = () => {
	const ucf = (s) => s[0].toUpperCase() + s.slice(1);
	const rhr = () =>
		getRandomHumanReadable({ adjCount: 2, colorsCount: 1, nounsCount: 1, joinWith: ' ' });
	return ['<b>', ucf(rhr()), '</b><br /><small>', getRandomSentence(), '</small>'].join(
		''
	);
};

export const getRandomInt = (min, exclusiveMax) => {
	min = Math.ceil(min);
	exclusiveMax = Math.floor(exclusiveMax);
	return Math.floor(Math.random() * (exclusiveMax - min) + min);
};

export const getRandomArrayItem = (arr) => arr[getRandomInt(0, arr.length)];

export const times = (n, cb) => {
	n = Math.abs(n);
	if (isNaN(n)) throw new TypeError(`Expecting number`);
	while (n-- > 0) cb();
};

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
