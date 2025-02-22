import { Feature, TextFeature } from './feature'
import { Element } from './parser'

export const features: Feature[] = [
	{ feature: 'page article ===', block: true, child: 'section', append: (element: Element) => `<div class="page-number">${element.index() + 1}</div>` },
	{ feature: 'section section ___', block: true, child: 'column' },
	{ feature: 'section header ^^^', block: true, child: 'column' },
	{ feature: 'section footer ~~~', block: true, child: 'column' },
	{ feature: 'column div |||', block: true, class: 'column column-$', textContainer: 'paragraph' },
	{ feature: 'hr hr --- \n', void: true, break: ['paragraph'] },
	{ feature: 'bold strong ** **' },
	{ feature: 'small small -- --' },
	{ feature: 'mark mark ++ ++' },
	{ feature: 'italic em * *' },
	{ feature: 'underline u __ __' },
	{ feature: 'stroke del ~~ ~~' },
	{ feature: 'sup sup ^ ^' },
	{ feature: 'sub sub ~ ~' },
	{ feature: 'quote q " "' },
	{ feature: 'header h$ # \n' },
	{ feature: 'title div @ \n', class: 'page-title', target: ['page'] },
	{ feature: 'center >><<', attribute: 'class', value: 'text-center', target: ['paragraph', 'column'], text: true },
	{ feature: 'left <<', attribute: 'class', value: 'text-left', target: ['paragraph', 'column'], text: true },
	{ feature: 'right >>', attribute: 'class', value: 'text-right', target: ['paragraph', 'column'], text: true },
	{ feature: 'paragraph p \n\n \n\n', multiline: true },
	{ feature: 'break br \n', void: true, parent: 'paragraph' },
	{ feature: 'root', block: true, child: 'page' }
].map((options) => {
	const [name, tag, start, end] = options.feature.split(' ')
	const feature = new Feature(name, tag, start, end)
	feature.setup(options)
	return feature
})

export function findFeature(name: string): Feature {
	return features.find((feature) => feature.name === name)!
}

export const textFeatures: TextFeature[] = [
	{ name: 'image', regexp: /!([0-9x]*[><]*)\[(.*?)\]\((.*?)\)/, replace: (_: string, attributes: string, alt: string, src: string) => `<img src="${src}" alt="${alt}"${parseAttributes(attributes)}>` },
	{
		name: 'autoimage',
		regexp: /(^|\s)!([0-9x]*[><]*)(https?:\/\/[^\s]+)/,
		replace: (_: string, before: string, attributes: string, src: string) => `${before}<img src="${src}"${parseAttributes(attributes)}>`
	},
	{ name: 'link', regexp: /\[(.*?)\]\((.*?)\)/, replace: '<a href="$2">$1</a>' },
	{ name: 'autolink', regexp: /(^|\s)(https?:\/\/[^\s]+)/, replace: '$1<a href="$2">$2</a>' },
	{ name: 'apostrophe', regexp: /'/g, replace: '’', parent: 'paragraph' }
].map((options) => {
	return new TextFeature(options.name, options.regexp, options.replace)
})

function parseAttributes(attributes: string): string {
	attributes = attributes.replace(';', '')

	if (!attributes) {
		return ''
	}

	let classes = ''
	if (attributes.endsWith('>><<')) {
		classes = 'img-center'
		attributes = attributes.slice(0, -4)
	} else if (attributes.endsWith('>>')) {
		classes = 'img-right'
		attributes = attributes.slice(0, -2)
	} else if (attributes.endsWith('<<')) {
		classes = 'img-left'
		attributes = attributes.slice(0, -2)
	}

	const [width, height] = attributes.split('x')

	if (!width && !height) {
		return ''
	}

	return `class="${classes}" width="${width ? width + 'px' : 'auto'}" height="${height ? height + 'px' : 'auto'}"`
}
