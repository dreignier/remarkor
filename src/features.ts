import { Element } from './parser'

export type Feature = {
	name: string
	start: string
	end?: string
	tag: string
	class?: string
	void?: boolean
	multiline?: boolean
	single?: boolean
	parent?: string
	line?: boolean
	block?: boolean
	child?: string
	trim?: boolean
	textContainer?: string
	initial?: boolean
	target?: string
	append?: (element: Element) => string
}

export const features: Feature[] = [
	{
		name: 'page',
		start: '===',
		tag: 'article',
		line: true,
		block: true,
		child: 'section',
		trim: true,
		initial: true,
		append: (element: Element) => `<div class="page-number">${element.index() + 1}</div>`
	},
	{ name: 'section', start: '___', tag: 'section', line: true, block: true, child: 'column', trim: true },
	{ name: 'section', start: '^^^', tag: 'header', line: true, block: true, child: 'column', trim: true },
	{ name: 'section', start: '~~~', tag: 'footer', line: true, block: true, child: 'column', trim: true },
	{ name: 'column', start: '|||', tag: 'div', class: 'column', line: true, block: true, trim: true, textContainer: 'paragraph' },
	{ name: 'hr', start: '---', tag: 'hr', void: true, single: true, line: true },
	{ name: 'bold', start: '**', end: '**', tag: 'strong' },
	{ name: 'small', start: '--', end: '--', tag: 'small' },
	{ name: 'mark', start: '++', end: '++', tag: 'mark' },
	{ name: 'italic', start: '*', end: '*', tag: 'em' },
	{ name: 'underline', start: '__', end: '__', tag: 'u' },
	{ name: 'stroke', start: '~~', end: '~~', tag: 'del' },
	{ name: 'sup', start: '^', end: '^', tag: 'sup' },
	{ name: 'sub', start: '~', end: '~', tag: 'sub' },
	{ name: 'header', start: '#', tag: 'h$', line: true },
	{ name: 'title', start: '@', tag: 'div', class: 'page-title', line: true, target: 'page' },
	{ name: 'paragraph', start: '\n\n', end: '\n\n', tag: 'p', multiline: true, trim: true },
	{ name: 'break', start: '\n', single: true, tag: 'br', void: true, parent: 'paragraph' }
].flatMap((feature: Feature) => {
	if (feature.block) {
		return [
			{ ...feature, start: '\n' + feature.start },
			{ ...feature, start: '\n\n' + feature.start }
		]
	} else if (feature.line && !feature.single) {
		return [
			{ ...feature, start: '\n' + feature.start, end: '\n' },
			{ ...feature, start: '\n\n' + feature.start, end: '\n' }
		]
	}

	return [feature]
})
