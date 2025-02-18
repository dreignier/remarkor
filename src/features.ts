export type Feature = {
	name: string
	start: string
	end?: string
	tag: string
	class?: string
	consumes?: string
	void?: boolean
	multiline?: boolean
	single?: boolean
	parent?: string
	line?: boolean
	block?: boolean
	child?: string
}

export const features: Feature[] = [
	{ name: 'page', start: '===', consumes: '=', tag: 'div', class: 'page', line: true, block: true, child: 'section' },
	{ name: 'section', start: '___', consumes: '_', tag: 'section', line: true, block: true, child: 'column' },
	{ name: 'column', start: '|||', consumes: '|', tag: 'section', line: true, block: true },
	{ name: 'bold', start: '**', end: '**', tag: 'strong' },
	{ name: 'small', start: '--', end: '--', tag: 'small' },
	{ name: 'mark', start: '++', end: '++', tag: 'mark' },
	{ name: 'italic', start: '*', end: '*', tag: 'em' },
	{ name: 'underline', start: '__', end: '__', tag: 'u' },
	{ name: 'stroke', start: '~~', end: '~~', tag: 'del' },
	{ name: 'sup', start: '^', end: '^', tag: 'sup' },
	{ name: 'sub', start: '~', end: '~', tag: 'sub' },
	{ name: 'header', start: '#', consumes: '#', tag: 'h$', line: true },
	{ name: 'hr', start: '---', consumes: '- ', tag: 'hr', void: true, line: true },
	{ name: 'paragraph', start: '\n\n', end: '\n\n', tag: 'p', multiline: true },
	{ name: 'break', start: '\n', single: true, tag: 'br', void: true, parent: 'p' }
].flatMap((feature: Feature) => {
	if (feature.block) {
		return [
			{ ...feature, start: '\n' + feature.start },
			{ ...feature, start: '\n\n' + feature.start }
		]
	} else if (feature.line) {
		return [
			{ ...feature, start: '\n' + feature.start, end: '\n' },
			{ ...feature, start: '\n\n' + feature.start, end: '\n' }
		]
	}

	return [feature]
})
