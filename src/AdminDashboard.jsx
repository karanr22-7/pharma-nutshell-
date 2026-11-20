
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from './supabase'
import './AdminDashboard.css'

function AdminDashboard() {
  const navigate = useNavigate()

  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [busyId, setBusyId] = useState(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('articles')
      .select('id, title, category, status, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      setError(error.message)
    } else {
      setArticles(data || [])
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const totalArticles = articles.length

  const publishedArticles = articles.filter(
    article => article.status === 'published'
  ).length

  const draftArticles = articles.filter(
    article => article.status === 'draft'
  ).length

  const totalCategories = new Set(
    articles.map(article => article.category)
  ).size

  const filteredArticles = articles.filter(article => {
    if (filter === 'all') return true
    return article.status === filter
  })

  const handleStatusChange = async (article) => {
    const newStatus =
      article.status === 'published' ? 'draft' : 'published'

    setBusyId(article.id)
    setError('')

    const { error } = await supabase
      .from('articles')
      .update({ status: newStatus })
      .eq('id', article.id)

    if (error) {
      setError(error.message)
    } else {
      await fetchArticles()
    }

    setBusyId(null)
  }

  const handleDelete = async (article) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${article.title}"?`
    )

    if (!confirmed) return

    setBusyId(article.id)
    setError('')

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', article.id)

    if (error) {
      setError(error.message)
    } else {
      await fetchArticles()
    }

    setBusyId(null)
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      alert('Unable to sign out. Please try again.')
      return
    }

    navigate('/admin', { replace: true })
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const actionButtonStyle = {
    padding: '8px 12px',
    borderRadius: '7px',
    border: '1px solid #dce3ea',
    background: '#fff',
    color: '#29415c',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: 600
  }

  return (
    <div className="dashboard">

      <aside className="dashboard-sidebar">

        <div className="dashboard-brand">
          <img src="/pharma-nutshell-icon.png" alt="Logo" />
          <div>
            <h2>Pharma Nutshell</h2>
            <span>Admin Panel</span>
          </div>
        </div>

        <nav className="dashboard-nav">
          <a className="active" href="#overview">▦ Overview</a>
          <a href="#articles">▤ Manage Articles</a>
          <Link to="/admin/create">＋ Create Article</Link>
          <a href="#categories">▧ Categories</a>
        </nav>

        <div className="dashboard-sidebar-bottom">
          <Link to="/">← Back to Website</Link>

          <button
            type="button"
            onClick={handleSignOut}
            className="signout-button"
          >
            ↪ Sign Out
          </button>
        </div>

      </aside>

      <main className="dashboard-main">

        <header className="dashboard-header">
          <div>
            <h1>Dashboard Overview</h1>
            <p>Welcome to your Pharma Nutshell workspace.</p>
          </div>

          <div className="admin-profile">
            <div className="admin-avatar">A</div>
            <span>Administrator</span>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <h2>Welcome to Pharma Nutshell!</h2>
            <p>Manage your pharmaceutical content from one place.</p>
          </div>
          <span className="welcome-icon">✦</span>
        </section>

        {/* Dashboard Statistics */}

        <section className="dashboard-stats" id="overview">

          <div className="stat-card">
            <span className="stat-icon">▤</span>
            <p>Total Articles</p>
            <h2>{loading ? '...' : totalArticles}</h2>
            <small>All your articles</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">✓</span>
            <p>Published</p>
            <h2>{loading ? '...' : publishedArticles}</h2>
            <small>Live on website</small>
          </div>

          <div className="stat-card">
            <span className="stat-icon orange">◷</span>
            <p>Drafts</p>
            <h2>{loading ? '...' : draftArticles}</h2>
            <small>Work in progress</small>
          </div>

          <div className="stat-card" id="categories">
            <span className="stat-icon purple">▧</span>
            <p>Categories</p>
            <h2>{loading ? '...' : totalCategories}</h2>
            <small>Content categories</small>
          </div>

        </section>

        {/* Manage Articles */}

        <section className="dashboard-content" id="articles">

          <div className="section-heading">
            <div>
              <h2>Manage Articles</h2>
              <p>View and manage all your pharmaceutical content.</p>
            </div>

            <Link to="/admin/create" className="create-button">
              + Create Article
            </Link>
          </div>

          {/* Article Filters */}

          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            margin: '22px 0'
          }}>

            {['all', 'published', 'draft'].map(option => (
              <button
                key={option}
                type="button"
                onClick={() => setFilter(option)}
                style={{
                  padding: '9px 17px',
                  borderRadius: '20px',
                  border: '1px solid #dce3ea',
                  background: filter === option ? '#142d4e' : '#fff',
                  color: filter === option ? '#fff' : '#526477',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textTransform: 'capitalize'
                }}
              >
                {option === 'all' ? 'All Articles' : option}
                {' '}
                ({option === 'all'
                  ? totalArticles
                  : articles.filter(
                      article => article.status === option
                    ).length})
              </button>
            ))}

          </div>

          {error && (
            <div className="empty-articles">
              <h3>Something went wrong</h3>
              <p>{error}</p>
            </div>
          )}

          {loading && (
            <div className="empty-articles">
              <p>Loading your articles...</p>
            </div>
          )}

          {!loading && !error && filteredArticles.length === 0 && (
            <div className="empty-articles">
              <div className="empty-icon">▤</div>
              <h3>No articles found</h3>
              <p>Articles matching this filter will appear here.</p>
            </div>
          )}

          {/* Article List */}

          {!loading && !error && filteredArticles.length > 0 && (

            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid #edf0f3',
              overflow: 'hidden'
            }}>

              {filteredArticles.map(article => (

                <div
                  key={article.id}
                  style={{
                    padding: '18px 22px',
                    borderBottom: '1px solid #edf0f3',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '15px',
                    flexWrap: 'wrap'
                  }}
                >

                  <div style={{ flex: '1 1 220px' }}>

                    <h3 style={{
                      color: '#142d4e',
                      fontSize: '15px',
                      margin: '0 0 7px'
                    }}>
                      {article.title}
                    </h3>

                    <p style={{
                      color: '#8290a0',
                      fontSize: '12px',
                      margin: 0
                    }}>
                      {article.category} · {formatDate(article.created_at)}
                    </p>

                    <span style={{
                      display: 'inline-block',
                      marginTop: '9px',
                      background: article.status === 'published'
                        ? '#e6f6ef'
                        : '#fff3df',
                      color: article.status === 'published'
                        ? '#16845b'
                        : '#b7791f',
                      padding: '5px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'capitalize'
                    }}>
                      {article.status}
                    </span>

                  </div>

                  {/* Article Actions */}

                  <div style={{
                    display: 'flex',
                    gap: '8px',
                    flexWrap: 'wrap'
                  }}>

                    <Link
                      to={`/admin/edit/${article.id}`}
                      style={{
                        ...actionButtonStyle,
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}
                    >
                      Edit
                    </Link>

                    <button
                      type="button"
                      style={actionButtonStyle}
                      onClick={() => handleStatusChange(article)}
                      disabled={busyId === article.id}
                    >
                      {busyId === article.id
                        ? 'Please wait...'
                        : article.status === 'published'
                          ? 'Unpublish'
                          : 'Publish'}
                    </button>

                    <button
                      type="button"
                      style={{
                        ...actionButtonStyle,
                        color: '#c0392b',
                        borderColor: '#f0d4d1'
                      }}
                      onClick={() => handleDelete(article)}
                      disabled={busyId === article.id}
                    >
                      Delete
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        <footer className="dashboard-footer">
          Pharma Nutshell · Complex Pharma. Simple Explanations.
        </footer>

      </main>

    </div>
  )
}

export default AdminDashboard
