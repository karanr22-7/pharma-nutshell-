
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from './supabase'
import './ArticleEditor.css'

function ArticleEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [references, setReferences] = useState('')
  const [currentStatus, setCurrentStatus] = useState('draft')

  const [selectedImage, setSelectedImage] = useState(null)
  const [coverImage, setCoverImage] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('')

  // Create a preview for the selected image
  useEffect(() => {
    if (!selectedImage) {
      setPreviewUrl('')
      return
    }

    const objectUrl = URL.createObjectURL(selectedImage)
    setPreviewUrl(objectUrl)

    return () => URL.revokeObjectURL(objectUrl)
  }, [selectedImage])

  // Fetch existing article when editing
  useEffect(() => {
    if (!id) return

    const fetchArticle = async () => {
      setFetching(true)

      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        setMessage(error.message || 'Unable to load article.')
        setMessageType('error')
      } else {
        setTitle(data.title || '')
        setDescription(data.description || '')
        setContent(data.content || '')
        setCategory(data.category || '')
        setReferences(data.article_references || '')
        setCurrentStatus(data.status || 'draft')
        setCoverImage(data.cover_image || '')
      }

      setFetching(false)
    }

    fetchArticle()
  }, [id])

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setMessage('Please select a valid image file.')
      setMessageType('error')
      e.target.value = ''
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage('Image size must be less than 5 MB.')
      setMessageType('error')
      e.target.value = ''
      return
    }

    setSelectedImage(file)
    setMessage('')
    setMessageType('')
  }

  // Upload image to Supabase Storage
  const uploadCoverImage = async () => {
    if (!selectedImage) return coverImage || null

    const safeFileName = selectedImage.name.replace(
      /[^a-zA-Z0-9._-]/g,
      '-'
    )

    const filePath = `${Date.now()}-${safeFileName}`

    const { error: uploadError } = await supabase.storage
      .from('article-covers')
      .upload(filePath, selectedImage, {
        cacheControl: '3600',
        upsert: false,
        contentType: selectedImage.type
      })

    if (uploadError) throw uploadError

    const { data } = supabase.storage
      .from('article-covers')
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  // Save article
  const saveArticle = async (status) => {
    setMessage('')
    setMessageType('')

    if (!title.trim() || !content.trim() || !category) {
      setMessage('Please enter the title, content and category.')
      setMessageType('error')
      return
    }

    setLoading(true)

    try {
      // Upload image first, if a new image was selected
      const imageUrl = await uploadCoverImage()

      const articleData = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        category,
        article_references: references.trim(),
        cover_image: imageUrl,
        status,
        updated_at: new Date().toISOString()
      }

      let error

      if (isEditing) {
        const result = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', id)

        error = result.error
      } else {
        const result = await supabase
          .from('articles')
          .insert([articleData])

        error = result.error
      }

      if (error) throw error

      setCurrentStatus(status)
      setCoverImage(imageUrl || '')
      setSelectedImage(null)

      setMessage(
        isEditing
          ? 'Article updated successfully!'
          : status === 'draft'
            ? 'Article saved as a draft successfully!'
            : 'Article published successfully!'
      )

      setMessageType('success')

      if (!isEditing) {
        setTitle('')
        setDescription('')
        setContent('')
        setCategory('')
        setReferences('')
        setCoverImage('')
      }

    } catch (error) {
      setMessage(error.message || 'Something went wrong. Please try again.')
      setMessageType('error')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="editor-page">
        <h2>Loading article...</h2>
      </div>
    )
  }

  return (
    <div className="editor-page">

      <header className="editor-header">
        <div>
          <Link to="/admin/dashboard">← Back to Dashboard</Link>
          <h1>{isEditing ? 'Edit Article' : 'Create New Article'}</h1>
          <p>Write and manage your pharmaceutical content.</p>
        </div>

        <span className="editor-status">
          {isEditing ? `Editing · ${currentStatus}` : 'New Article'}
        </span>
      </header>

      <div className="editor-layout">

        <main className="editor-main">

          <section className="editor-card">
            <h2>Article Details</h2>

            <label>Article Title</label>
            <input
              type="text"
              placeholder="Enter your article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <label>Short Description</label>
            <textarea
              rows="3"
              placeholder="Write a short introduction to your article..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <label>Article Content</label>
            <textarea
              className="article-content-input"
              rows="15"
              placeholder="Start writing your article here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </section>

          <section className="editor-card">
            <h2>References & Sources</h2>

            <p className="editor-help">
              Add research papers, journals and reliable medical sources.
            </p>

            <textarea
              rows="4"
              placeholder="Enter your references and source links..."
              value={references}
              onChange={(e) => setReferences(e.target.value)}
            />
          </section>

        </main>

        <aside className="editor-sidebar">

          <section className="editor-card">
            <h2>Publishing</h2>

            <label>Article Category</label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="" disabled>Select category</option>
              <option>Pharmacology</option>
              <option>Pharmaceutics</option>
              <option>Pharmaceutical Chemistry</option>
              <option>Clinical Pharmacy</option>
              <option>Drug Research</option>
              <option>Healthcare</option>
            </select>

            <label>Cover Image</label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={loading}
            />

            <div className="image-upload-note">
              Choose an image up to 5 MB.
              Supported formats include JPG, PNG and WebP.
            </div>

            {(previewUrl || coverImage) && (
              <div style={{ marginTop: '15px' }}>

                <p style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  marginBottom: '8px'
                }}>
                  Image Preview
                </p>

                <img
                  src={previewUrl || coverImage}
                  alt="Article cover preview"
                  style={{
                    width: '100%',
                    maxHeight: '220px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '1px solid #e5e7eb'
                  }}
                />

                {selectedImage && (
                  <p style={{
                    fontSize: '12px',
                    color: '#16845b',
                    marginTop: '8px'
                  }}>
                    New image selected. It will upload when you save.
                  </p>
                )}

              </div>
            )}

          </section>

          <section className="editor-card editor-guidelines">
            <h3>Content Guidelines</h3>

            <ul>
              <li>Use reliable scientific sources.</li>
              <li>Include references for medical claims.</li>
              <li>Use clear and simple explanations.</li>
              <li>Avoid misleading health information.</li>
            </ul>
          </section>

        </aside>

      </div>

      {message && (
        <p
          role="alert"
          style={{
            color: messageType === 'success' ? 'green' : '#d9534f',
            padding: '12px',
            textAlign: 'center'
          }}
        >
          {message}
        </p>
      )}

      <div className="editor-actions">

        <button
          type="button"
          className="draft-button"
          disabled={loading}
          onClick={() => saveArticle('draft')}
        >
          {loading
            ? 'Saving...'
            : isEditing
              ? 'Save as Draft'
              : 'Save Draft'}
        </button>

        <button
          type="button"
          className="publish-button"
          disabled={loading}
          onClick={() => saveArticle('published')}
        >
          {loading
            ? 'Processing...'
            : isEditing
              ? 'Publish / Save Changes'
              : 'Publish'}
        </button>

      </div>

    </div>
  )
}

export default ArticleEditor
