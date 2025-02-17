export type Feature = { start: string; end: string; tag: string; before?: string; after?: string; trim?: boolean }

export const features = [
	{ start: '**', end: '**', tag: 'strong' },
	{ start: '*', end: '*', tag: 'em' },
	{ start: '__', end: '__', tag: 'u' },
	{ start: '\n#', end: '\n', tag: 'h1', before: '\n', after: '\n\n', trim: true }
].sort((a, b) => b.start.length - a.start.length)
