const files = import.meta.glob<string>('./questions/*.json', {
  eager: true,
  query: '?raw',
  import: 'default',
})

/** Question files as written, for use as starting templates in the lab. */
export const questionFiles: readonly { id: string; text: string }[] = Object.entries(files)
  .map(([path, text]) => ({ id: path.replace(/^.*\/|\.json$/g, ''), text }))
  .sort((a, b) => a.id.localeCompare(b.id))
