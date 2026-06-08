import EN_US from "./en-us.json";
import KO_KR from "./ko-kr.json";

function isObject(item: any) {
	return item && typeof item === "object" && !Array.isArray(item);
}

function merge(target: any, source: any): any {
	const output = Object.assign({}, target);
	if (isObject(target) && isObject(source)) {
		Object.keys(source).forEach((key) => {
			if (isObject(source[key])) {
				if (!(key in target)) {
					Object.assign(output, { [key]: source[key] });
				} else {
					output[key] = merge(target[key], source[key]);
				}
			} else {
				Object.assign(output, { [key]: source[key] });
			}
		});
	}
	return output;
}

function getTranslations() {
	let isKorean = false;
	if (typeof navigator !== "undefined" && navigator.language) {
		isKorean = navigator.language.startsWith("ko");
	} else {
		const envLang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || process.env.LC_MESSAGES;
		if (envLang && envLang.toLowerCase().includes("ko")) {
			isKorean = true;
		} else {
			// On Windows, LANG env is often unset. Since this app runs on the user's machine,
			// and their environment is Korean, we default to Korean in main process as well.
			isKorean = true;
		}
	}

	if (isKorean) {
		return merge(EN_US, KO_KR);
	}
	return EN_US;
}

const STRINGS = getTranslations();

export default STRINGS;
