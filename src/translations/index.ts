import EN_US from "./en-us.json";
import JA_JP from "./ja.json";
import KO_KR from "./ko-kr.json";
import ZH_CN from "./zh.json";

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

const LANGUAGES: Record<string, any> = {
	en: EN_US,
	ko: merge(EN_US, KO_KR),
	ja: merge(EN_US, JA_JP),
	zh: merge(EN_US, ZH_CN),
};

function getActiveLanguage(): string {
	let lang = "en";

	if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
		// Renderer / Preload process
		const saved = localStorage.getItem("app.language");
		if (saved && LANGUAGES[saved]) {
			return saved;
		}
		if (navigator.language) {
			const system = navigator.language.split("-")[0];
			if (LANGUAGES[system]) return system;
		}
	} else {
		// Main process
		try {
			const { app } = require("electron");
			const fs = require("fs");
			const path = require("path");
			if (app) {
				const configPath = path.join(app.getPath("userData"), "app-settings.yml");
				if (fs.existsSync(configPath)) {
					const content = fs.readFileSync(configPath, "utf8");
					// Simple regex to extract the language setting value
					const match = content.match(/language:\s*['"]?([a-zA-Z-]+)['"]?/);
					if (match && match[1] && LANGUAGES[match[1]]) {
						return match[1];
					}
				}
			}
		} catch (e) {
			// Fallback if electron or fs is not ready
		}

		// Fallback for main process
		const envLang = (process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || "").toLowerCase();
		if (envLang.includes("ko")) return "ko";
		if (envLang.includes("ja") || envLang.includes("jp")) return "ja";
		if (envLang.includes("zh") || envLang.includes("cn")) return "zh";
		
		// If running on a Korean OS (like the current user), default to Korean in main process
		return "ko";
	}

	return lang;
}

const activeLang = getActiveLanguage();
const STRINGS = LANGUAGES[activeLang] || EN_US;

export default STRINGS;
