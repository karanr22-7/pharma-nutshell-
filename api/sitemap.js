
export default async function handler(req, res) {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).send('Sitemap configuration missing')
  }

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/articles?select=id,updated_at,created_at&status=eq.published`,
      {
        headers: {
          apikey: supabaseKey
        }
      }
    )

    if (!response.ok) {
      throw new Error('Could not retrieve published articles')
    }

    const articles = await response.json()
    const baseUrl = 'https://pharma-nutshell.vercel.app'

    const urls = [
      `<url><loc>${baseUrl}/</loc></url>`,
      ...articles.map(article => {
        const lastModified = article.updated_at || article.created_at

        return `
          <url>
            <loc>${baseUrl}/article/${article.id}</loc>
            ${lastModified ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>` : ''}
          </url>
        `
      })
    ]

    const sitemap = `
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls.join('\n')}
      </urlset>
    `

    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, s-maxage=3600')
    return res.status(200).send(sitemap)
  } catch (error) {
    console.error(error)
    return res.status(500).send('Unable to generate sitemap')
  }
}
