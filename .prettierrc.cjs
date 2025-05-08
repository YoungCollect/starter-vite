module.exports = {
	// When the characters is more than 80 in the line, it will wrap.
	printWidth: 80,
	// The indent space is 2.
	tabWidth: 2,
	// The indent style is tab, not space.
	useTabs: false,
	// Don't use semicolon at the end.
	semi: false,
	// Use single quote.
	singleQuote: true,
	// If only when the object props need quotes, should add the quotes.
	quoteProps: 'as-needed',
	// Don't need the trailing comma.
	trailingComma: 'none',
	// Use spaces in the bracket.
	bracketSpacing: true,
	// The end bracket should be same line with the element attribute.
	bracketSameLine: true,
	// Don't use parenstheses when the arrow funtion params is only one.
	arrowParens: 'avoid',
	// The end of line is lf.
	endOfLine: 'lf',
	// It should be single attribute at per line in html or vue template.
	singleAttributePerLine: true,
	// Don't indent script and style at the begin in vue file.
	vueIndentScriptAndStyle: false,
	// The space in inline element should display as css rules, but choose ignore in CLI project. See: https://prettier.io/blog/2018/11/07/1.15.0.html#whitespace-sensitive-formatting
	htmlWhitespaceSensitivity: 'ignore',
	// Keep the prose style of your writing in markdown.
	proseWrap: 'preserve'
}
