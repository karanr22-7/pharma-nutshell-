
import './App.css'
import { Routes, Route, Link, useParams, Navigate } from 'react-router-dom'
import AdminLogin from './AdminLogin'
import AdminDashboard from './AdminDashboard'
import ArticleEditor from './ArticleEditor'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'

const sampleArticles = [
  {
    category: 'PHARMACEUTICAL',
    title: 'Understanding the Science Behind Modern Medicines',
    description: 'Explore how medicines are developed, tested and manufactured to improve human health.',
    author: 'Editorial Team',
    date: 'Nov 10, 2026',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'
  },
  {
    category: 'MEDICAL SCIENCE',
    title: 'The Importance of Preventive Healthcare',
    description: 'Discover why early detection and regular health checkups matter for a healthier life.',
    author: 'Editorial Team',
    date: 'Nov 08, 2026',
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800'
  },
  {
    category: 'RESEARCH',
    title: 'Exploring the Future of Pharmaceutical Research',
    description: 'A look at emerging scientific approaches and innovations in drug discovery.',
    author: 'Editorial Team',
    date: 'Nov 05, 2026',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800'
  }
]

const categories = [
  { icon: '⚕', title: 'Medical Science', text: 'Medical knowledge and healthcare education' },
  { icon: '⚗', title: 'Pharmacy', text: 'Medicines, drugs and pharmaceutical science' },
  { icon: '🔬', title: 'Research', text: 'Scientific discoveries and innovations' },
  { icon: '♡', title: 'Health & Wellness', text: 'Health awareness and healthy living' }
]

// Helper function for updating SEO metadata
function updateMetaTag(attribute, key, content) {
  let element = document.querySelector(
    `meta[${attribute}="${key}"]`
  )

  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }

  element.setAttribute('content', content)
}

// Helper function for updating canonical URL
function updateCanonicalUrl(path) {
  let link = document.querySelector('link[rel="canonical"]')

  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }

  link.setAttribute('href', `${window.location.origin}${path}`)
}

function HomePage() {
  const [articles, setArticles] = useState([])
  const [loadingArticles, setLoadingArticles] = useState(true)
  const [articleError, setArticleError] = useState('')

  useEffect(() => {
    updateCanonicalUrl('/')

    let active = true

    const fetchPublishedArticles = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, description, category, cover_image, created_at')
        .eq('status', 'published')
        .order('created_at', { ascending: false })

      if (!active) return

      if (error) {
        setArticleError(error.message)
      } else {
        setArticles(data || [])
      }

      setLoadingArticles(false)
    }

    fetchPublishedArticles()

    return () => {
      active = false
    }
  }, [])

  const displayArticles = articles.length > 0
    ? articles
    : sampleArticles

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="website">

      <div className="top-bar">
        <p>Knowledge • Science • Better Healthcare</p>
        <p>Trusted Medical & Pharmaceutical Information</p>
      </div>

      <header className="navbar">
        <a href="#home" className="brand">
          <img
            src="/pharma-nutshell-icon.png"
            alt="Pharma Nutshell Logo"
            className="brand-logo"
          />
          <span>
            <strong>Pharma Nutshell</strong>
            <small>Complex Pharma. Simple Explanations.</small>
          </span>
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#categories">Categories</a>
          <a href="#articles">Articles</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>

        <a href="#articles" className="nav-button">Explore Articles ↗</a>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="eyebrow">✦ YOUR HEALTH, OUR KNOWLEDGE</span>

            <h1>
              Discover the Science
              Behind <span>Better Health.</span>
            </h1>

            <p>
              Explore reliable medical knowledge, pharmaceutical
              insights and scientific discoveries that make
              healthcare easier to understand.
            </p>

            <div className="hero-actions">
              <a href="#articles" className="primary-button">
                Explore Articles →
              </a>

              <a href="#about" className="secondary-button">
                Discover More
              </a>
            </div>

            <div className="hero-note">
              <span>✓</span> Educational content backed by scientific references
            </div>
          </div>

          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1000"
              alt="Medical professional working in healthcare"
            />

            <div className="floating-card">
              <span>✚</span>
              <div>
                <strong>Knowledge for Everyone</strong>
                <small>Learn. Explore. Understand.</small>
              </div>
            </div>
          </div>
        </section>

        <section className="categories section" id="categories">
          <div className="section-heading">
            <div>
              <span className="eyebrow">EXPLORE OUR CONTENT</span>
              <h2>Knowledge Across Healthcare</h2>
            </div>

            <p>Explore different areas of medical and pharmaceutical science.</p>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <article className="category-card" key={category.title}>
                <div className="category-icon">{category.icon}</div>
                <h3>{category.title}</h3>
                <p>{category.text}</p>
                <a href="#articles">Explore →</a>
              </article>
            ))}
          </div>
        </section>

        <section className="articles section" id="articles">
          <div className="section-heading">
            <div>
              <span className="eyebrow">LATEST UPDATES</span>
              <h2>Featured Articles</h2>
            </div>

            <a href="#articles" className="view-all">View all articles →</a>
          </div>

          {loadingArticles && (
            <p>Loading latest articles...</p>
          )}

          {articleError && (
            <p>Unable to load published articles at the moment.</p>
          )}

          <div className="article-grid">
            {!loadingArticles && displayArticles.map((article) => (
              <article
                className="article-card"
                key={article.id || article.title}
              >
                <img
                  src={article.cover_image || article.image || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800'}
                  alt={article.title}
                />

                <div className="article-content">
                  <span className="article-category">
                    {article.category}
                  </span>

                  <h3>{article.title}</h3>

                  <p>
                    {article.description || 'Explore this pharmaceutical and medical science article.'}
                  </p>

                  <div className="article-meta">
                    <span>Editorial Team</span>
                    <span>
                      {article.created_at
                        ? formatDate(article.created_at)
                        : article.date}
                    </span>
                  </div>

                  <Link to={`/article/${article.id || 'sample'}`}>
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {!loadingArticles && articles.length === 0 && (
            <p style={{
              textAlign: 'center',
              color: '#8290a0',
              fontSize: '13px',
              marginTop: '15px'
            }}>
              Sample articles are displayed until your first article is published.
            </p>
          )}
        </section>

        <section className="about-section" id="about">
          <div>
            <span className="eyebrow">ABOUT OUR PLATFORM</span>
            <h2>Making Medical Knowledge Accessible to Everyone.</h2>
          </div>

          <p>
            Our goal is to share educational medical and pharmaceutical
            information in a clear, accessible and responsible way.
            We believe informed knowledge is an important part of
            better healthcare.
          </p>
        </section>

        <section className="newsletter" id="contact">
          <span className="eyebrow">STAY INFORMED</span>
          <h2>Keep Learning. Stay Updated.</h2>
          <p>Explore our latest medical and pharmaceutical articles.</p>
          <a href="#articles" className="primary-button">Discover Articles →</a>
        </section>
      </main>

      <footer>
        <div className="footer-brand">
          <img
            src="/pharma-nutshell-icon.png"
            alt="Pharma Nutshell Logo"
            className="brand-logo"
          />
          <strong>Pharma Nutshell</strong>
        </div>

        <p>Complex Pharma. Simple Explanations.</p>

        <p className="disclaimer">
          Disclaimer: Content is intended for educational purposes only
          and is not a substitute for professional medical advice.
        </p>

        <div className="copyright">
          © 2026 Pharma Nutshell. All rights reserved.
        </div>
      </footer>

    </div>
  )
}

function ArticlePage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Automatically update SEO for each article
  useEffect(() => {
    if (!article) return

    const pageTitle = `${article.title} | Pharma Nutshell`

    const pageDescription =
      article.description ||
      'Explore pharmaceutical and medical science knowledge with Pharma Nutshell.'

    const canonicalUrl =
      `${window.location.origin}${window.location.pathname}`

    document.title = pageTitle

    // Set canonical URL
    updateCanonicalUrl(window.location.pathname)

    // Update standard SEO metadata
    updateMetaTag('name', 'description', pageDescription)

    // Update Open Graph metadata
    updateMetaTag('property', 'og:type', 'article')
    updateMetaTag('property', 'og:title', pageTitle)
    updateMetaTag('property', 'og:description', pageDescription)

    updateMetaTag(
      'property',
      'og:image',
      article.cover_image || '/pharma-nutshell-icon.png'
    )

    // Update Twitter metadata
    updateMetaTag('name', 'twitter:card', 'summary_large_image')
    updateMetaTag('name', 'twitter:title', pageTitle)
    updateMetaTag('name', 'twitter:description', pageDescription)

    updateMetaTag(
      'name',
      'twitter:image',
      article.cover_image || '/pharma-nutshell-icon.png'
    )

    // Create BlogPosting structured data
    const articleSchema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',

      headline: article.title,
      description: pageDescription,
      url: canonicalUrl,

      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl
      },

      author: {
        '@type': 'Organization',
        name: 'Pharma Nutshell Editorial Team'
      },

      publisher: {
        '@type': 'Organization',
        name: 'Pharma Nutshell',
        logo: {
          '@type': 'ImageObject',
          url: `${window.location.origin}/pharma-nutshell-icon.png`
        }
      },

      ...(article.created_at && {
        datePublished: article.created_at
      }),

      ...(article.cover_image && {
        image: [article.cover_image]
      }),

      articleSection: article.category
    }

    // Add structured data to the page
    let schemaScript = document.getElementById('article-schema')

    if (!schemaScript) {
      schemaScript = document.createElement('script')
      schemaScript.id = 'article-schema'
      schemaScript.type = 'application/ld+json'
      document.head.appendChild(schemaScript)
    }

    schemaScript.textContent = JSON.stringify(articleSchema)
      .replace(/</g, '\\u003c')

    // Cleanup when leaving the article page
    return () => {
      document.title = 'Pharma Nutshell | Complex Pharma. Simple Explanations.'

      // Restore homepage canonical URL
      updateCanonicalUrl('/')

      // Remove article structured data
      document.getElementById('article-schema')?.remove()

      // Restore homepage metadata
      updateMetaTag(
        'name',
        'description',
        'Explore pharmaceutical sciences, pharmacology, drug research, pharmaceutics and healthcare topics explained in simple, easy-to-understand language.'
      )

      updateMetaTag('property', 'og:type', 'website')

      updateMetaTag(
        'property',
        'og:title',
        'Pharma Nutshell | Complex Pharma. Simple Explanations.'
      )

      updateMetaTag(
        'property',
        'og:description',
        'Explore pharmaceutical sciences, pharmacology, drug research and healthcare explained simply.'
      )

      updateMetaTag(
        'property',
        'og:image',
        '/pharma-nutshell-icon.png'
      )

      updateMetaTag('name', 'twitter:card', 'summary')
      updateMetaTag('name', 'twitter:title', 'Pharma Nutshell')

      updateMetaTag(
        'name',
        'twitter:description',
        'Complex Pharma. Simple Explanations.'
      )

      updateMetaTag(
        'name',
        'twitter:image',
        '/pharma-nutshell-icon.png'
      )
    }
  }, [article])

  // Fetch article from Supabase
  useEffect(() => {
    let active = true

    const fetchArticle = async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, title, description, content, category, cover_image, article_references, created_at')
        .eq('id', id)
        .eq('status', 'published')
        .maybeSingle()

      if (!active) return

      if (error) {
        setError(error.message)
      } else {
        setArticle(data)
      }

      setLoading(false)
    }

    if (id !== 'sample') {
      fetchArticle()
    } else {
      setLoading(false)
    }

    return () => {
      active = false
    }
  }, [id])

  if (loading) {
    return <p style={{ padding: '50px' }}>Loading article...</p>
  }

  if (error || !article) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>Article not found</h2>
        <Link to="/">← Back to Home</Link>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth: '850px',
      margin: '50px auto',
      padding: '25px',
      color: '#243b53'
    }}>
      <Link to="/" style={{ color: '#159b8c' }}>← Back to Home</Link>

      <p style={{ color: '#159b8c', marginTop: '30px' }}>
        {article.category}
      </p>

      <h1 style={{ color: '#142d4e', fontSize: '36px' }}>
        {article.title}
      </h1>

      <p style={{ color: '#8290a0' }}>
        {formatArticleDate(article.created_at)}
      </p>

      {article.cover_image && (
        <img
          src={article.cover_image}
          alt={article.title}
          style={{
            width: '100%',
            borderRadius: '12px',
            margin: '20px 0'
          }}
        />
      )}

      <p style={{ fontSize: '18px', lineHeight: 1.8 }}>
        {article.description}
      </p>

      <div style={{
        whiteSpace: 'pre-wrap',
        lineHeight: 1.9,
        fontSize: '16px'
      }}>
        {article.content}
      </div>

      {article.article_references && (
        <section style={{ marginTop: '40px' }}>
          <h2>References & Sources</h2>
          <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {article.article_references}
          </p>
        </section>
      )}
    </div>
  )
}

function formatArticleDate(date) {
  return date
    ? new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : ''
}

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let mounted = true

    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession()
      const session = data?.session

      if (!mounted) return

      if (error || !session) {
        setStatus('denied')
        return
      }

      if (
        session.user.email?.toLowerCase() !==
        'karunyar2202@gmail.com'
      ) {
        await supabase.auth.signOut()

        if (mounted) setStatus('denied')
        return
      }

      setStatus('allowed')
    }

    checkSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return

      if (
        session?.user.email?.toLowerCase() ===
        'karunyar2202@gmail.com'
      ) {
        setStatus('allowed')
      } else {
        setStatus('denied')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  if (status === 'checking') {
    return <p>Checking admin access...</p>
  }

  if (status === 'denied') {
    return <Navigate to="/admin" replace />
  }

  return children
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route path="/article/:id" element={<ArticlePage />} />

      <Route path="/admin" element={<AdminLogin />} />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Create new article */}
      <Route
        path="/admin/create"
        element={
          <ProtectedRoute>
            <ArticleEditor />
          </ProtectedRoute>
        }
      />

      {/* Edit existing article */}
      <Route
        path="/admin/edit/:id"
        element={
          <ProtectedRoute>
            <ArticleEditor />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
