import { Feature, TextFeature } from './feature'
import { Element } from './parser'

export const features: Feature[] = [
	{ feature: 'page article ===', block: true, child: 'section', append: (element: Element) => `<div class="page-number">${element.index() + 1}</div>` },
	{ feature: 'section section ___', block: true, child: 'column' },
	{ feature: 'section header ^^^', block: true, child: 'column' },
	{ feature: 'section footer ~~~', block: true, child: 'column' },
	{ feature: 'column div |||', block: true, class: 'column', textContainer: 'paragraph' },
	{ feature: 'hr hr --- \n', void: true },
	{ feature: 'bold strong ** **' },
	{ feature: 'small small -- --' },
	{ feature: 'mark mark ++ ++' },
	{ feature: 'italic em * *' },
	{ feature: 'underline u __ __' },
	{ feature: 'stroke del ~~ ~~' },
	{ feature: 'sup sup ^ ^' },
	{ feature: 'sub sub ~ ~' },
	{ feature: 'header h$ # \n' },
	{ feature: 'title div @ \n', class: 'page-title', target: ['page'] },
	{ feature: 'paragraph p \n\n \n\n', multiline: true },
	{ feature: 'break br \n', void: true, parent: 'paragraph' }
].map((options) => {
	const [name, tag, start, end] = options.feature.split(' ')
	const feature = new Feature(name, tag, start, end)
	feature.setup(options)
	return feature
})

export const textFeatures: TextFeature[] = [
	{ name: 'image', regexp: /!([0-9x]*)\[(.*?)\]\((.*?)\)/, replace: (_: string, size: string, alt: string, src: string) => `<img src="${src}" alt="${alt}"${parseSize(size)}>` },
	{ name: 'autoimage', regexp: /(^|\s)!([0-9x]+;)?(https?:\/\/[^\s]+)/, replace: (_: string, before: string, size: string, src: string) => `${before}<img src="${src}"${parseSize(size)}>` },
	{ name: 'link', regexp: /\[(.*?)\]\((.*?)\)/, replace: '<a href="$2">$1</a>' },
	{ name: 'autolink', regexp: /(^|\s)(https?:\/\/[^\s]+)/, replace: '$1<a href="$2">$2</a>' }
].map((options) => {
	return new TextFeature(options.name, options.regexp, options.replace)
})

function parseSize(size: string): string {
	if (!size) {
		return ''
	}

	const [width, height] = size.replace(';', '').split('x')

	if (!width && !height) {
		return ''
	}

	return ` width="${width ? width + 'px' : 'auto'}" height="${height ? height + 'px' : 'auto'}"`
}
