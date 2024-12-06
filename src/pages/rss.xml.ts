import rss from '@astrojs/rss'
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from '../config'
import { getCollection } from 'astro:content'

export const get = async () => {
  const posts = await getCollection('blog')

  const sortedPosts = posts
    .filter((p) => p.data.draft !== true)
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf())

  let baseUrl = SITE_URL
  // removing trailing slash if found
  // https://example.com/ => https://example.com
  baseUrl = baseUrl.replace(/\/+$/g, '')

  const rssItems = sortedPosts.map(({ data, id }) => {
    if (data.external) {
      const title = data.title
      const pubDate = data.date
      const link = data.url

      return {
        title,
        pubDate,
        link,
      }
    }

    const title = data.title
    const pubDate = data.date
    const description = data.description
    const link = `${baseUrl}/blog/${id}`

    return {
      title,
      pubDate,
      description,
      link,
    }
  })

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: baseUrl,
    items: rssItems,
  })
}
