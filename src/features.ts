export type Feature = { start: string; end?: string; tag?: string; html?: string; consumes?: string; void?: boolean; multiline?: boolean; single?: boolean; parent?: string; line?: boolean }

export const features: Feature[] = [
	{ start: '\n====\n', consumes: '=', html: '</div>\n</section></section>\n<section><section>\n<div class="page">', single: true },
	{ start: '\n\n====\n', consumes: '=', html: '</div>\n</section></section>\n<section><section>\n<div class="page">', single: true },
	{ start: '\n____\n', consumes: '_', html: '\n</section></section>\n<section><section>\n', single: true },
	{ start: '\n\n____\n', consumes: '_', html: '\n</section></section>\n<section><section>\n', single: true },
	{ start: '\n||||\n', consumes: '|', html: '\n</section>\n<section>\n', single: true },
	{ start: '\n\n||||\n', consumes: '|', html: '\n</section>\n<section>\n', single: true },
	{ start: '**', end: '**', tag: 'strong' },
	{ start: '--', end: '--', tag: 'small' },
	{ start: '++', end: '++', tag: 'mark' },
	{ start: '*', end: '*', tag: 'em' },
	{ start: '__', end: '__', tag: 'u' },
	{ start: '~~', end: '~~', tag: 'del' },
	{ start: '^', end: '^', tag: 'sup' },
	{ start: '~', end: '~', tag: 'sub' },
	{ start: '#', consumes: '#', tag: 'h$', line: true },
	{ start: '---', consumes: '- ', tag: 'hr', void: true, line: true },
	{ start: '\n\n', end: '\n\n', tag: 'p', multiline: true },
	{ start: '\n', single: true, tag: 'br', void: true, parent: 'p' }
].flatMap((feature: Feature) => {
	if (feature.line) {
		return [
			{ ...feature, start: '\n' + feature.start, end: '\n' },
			{ ...feature, start: '\n\n' + feature.start, end: '\n' }
		]
	}

	return [feature]
})
