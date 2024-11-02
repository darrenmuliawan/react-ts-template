module.exports = {
	env: { browser: true, es2020: true },
	extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:react-hooks/recommended"],
	parser: "@typescript-eslint/parser",
	parserOptions: { ecmaVersion: "latest", sourceType: "module" },
	plugins: [],
	rules: {
		"@typescript-eslint/no-unused-vars": "off",
		"@typescript-eslint/no-empty-function": "off",
		"import/extensions": "off",
		"import/no-cycle": "off",
		"import/no-extraneous-dependencies": "off",
		"import/no-named-as-default": "off",
		"import/no-unresolved": "off",
		"jsx-a11y/label-has-associated-control": "off",
		"no-alert": "off",
		"react/react-in-jsx-scope": "off",
	},
};
