module.exports = {
	env: {
		browser: true,
		es2022: true
	},
	extends: [
		"eslint:recommended",
		"plugin:@typescript-eslint/eslint-recommended",
		"plugin:@typescript-eslint/strict-type-checked"
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		project: "tsconfig.json",
		sourceType: "module"
	},
	plugins: [
		"@typescript-eslint"
	],
	rules: {
		"@typescript-eslint/ban-ts-comment": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/no-unnecessary-condition": "off", // has bugs
		"@typescript-eslint/no-unsafe-assignment": "off",
		"@typescript-eslint/no-unsafe-call": "off",
		// "@typescript-eslint/no-unsafe-member-access": "off",
		"no-unused-expressions": "error",
		// "@typescript-eslint/no-var-requires": "off",
		"@typescript-eslint/restrict-plus-operands": "off",
		"@typescript-eslint/restrict-template-expressions": "off",
		"@typescript-eslint/switch-exhaustiveness-check": "error",
	}
}
