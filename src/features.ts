export type Feature = { start: string; end?: string; tag: string; consumes?: string; void?: boolean; multiline?: boolean }

export const features = [
	{ start: '**', end: '**', tag: 'strong' },
	{ start: '*', end: '*', tag: 'em' },
	{ start: '__', end: '__', tag: 'u' },
	{ start: '#', consumes: '#', tag: 'h$' },
	{ start: '---', consumes: '- ', tag: 'hr', void: true },
	{ start: '\n\n', end: '\n\n', tag: 'p', multiline: true }
]

for (const feature of features) {
	if (!feature.end) {
		feature.start = '\n' + feature.start
		feature.end = '\n'
	}
}
