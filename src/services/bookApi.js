/**
 * Service d'API pour récupérer les informations des livres
 * Stratégie multi-sources pour maximiser les chances de trouver les livres français
 */

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes'
const OPEN_LIBRARY_API = 'https://openlibrary.org'
const COVERS_API = 'https://covers.openlibrary.org'

/**
 * Recherche un livre par ISBN avec plusieurs stratégies
 * @param {string} isbn - ISBN-10 ou ISBN-13
 * @returns {Promise<object|null>}
 */
export const fetchBookByISBN = async (isbn) => {
  const cleanISBN = isbn.replace(/[-\s]/g, '')
  
  console.log('🔍 Recherche ISBN:', cleanISBN)
  
  // Stratégie 1: Google Books avec ISBN
  try {
    console.log('📚 Tentative Google Books (isbn:)...')
    const result = await fetchFromGoogleBooks(cleanISBN, `isbn:${cleanISBN}`)
    if (result && result.title) {
      console.log('✅ Trouvé sur Google Books:', result.title)
      
      // Essayer d'ajouter une couverture Open Library si Google n'en a pas
      if (!result.coverUrl) {
        result.coverUrl = await getOpenLibraryCover(cleanISBN)
      }
      
      return result
    }
  } catch (error) {
    console.warn('❌ Google Books (isbn:) échoué:', error.message)
  }
  
  // Stratégie 2: Google Books recherche directe par numéro
  try {
    console.log('📚 Tentative Google Books (recherche directe)...')
    const result = await fetchFromGoogleBooks(cleanISBN, cleanISBN)
    if (result && result.title) {
      console.log('✅ Trouvé sur Google Books (direct):', result.title)
      
      if (!result.coverUrl) {
        result.coverUrl = await getOpenLibraryCover(cleanISBN)
      }
      
      return result
    }
  } catch (error) {
    console.warn('❌ Google Books (direct) échoué:', error.message)
  }
  
  // Stratégie 3: Open Library ISBN API
  try {
    console.log('📚 Tentative Open Library ISBN...')
    const result = await fetchFromOpenLibraryISBN(cleanISBN)
    if (result && result.title) {
      console.log('✅ Trouvé sur Open Library:', result.title)
      return result
    }
  } catch (error) {
    console.warn('❌ Open Library ISBN échoué:', error.message)
  }
  
  // Stratégie 4: Open Library Search API
  try {
    console.log('📚 Tentative Open Library Search...')
    const result = await fetchFromOpenLibrarySearch(cleanISBN)
    if (result && result.title) {
      console.log('✅ Trouvé sur Open Library Search:', result.title)
      return result
    }
  } catch (error) {
    console.warn('❌ Open Library Search échoué:', error.message)
  }
  
  // Stratégie 5: Open Library Books API (format différent)
  try {
    console.log('📚 Tentative Open Library Books API...')
    const result = await fetchFromOpenLibraryBooksAPI(cleanISBN)
    if (result && result.title) {
      console.log('✅ Trouvé sur Open Library Books API:', result.title)
      return result
    }
  } catch (error) {
    console.warn('❌ Open Library Books API échoué:', error.message)
  }
  
  console.log('❌ Livre non trouvé pour ISBN:', cleanISBN)
  return null
}

/**
 * Récupère la couverture depuis Open Library
 */
const getOpenLibraryCover = async (isbn) => {
  const coverUrl = `${COVERS_API}/b/isbn/${isbn}-L.jpg`
  
  try {
    // Vérifier si la couverture existe (Open Library retourne une image 1x1 si pas de couverture)
    const response = await fetch(coverUrl, { method: 'HEAD' })
    const contentLength = response.headers.get('content-length')
    
    // Si l'image fait moins de 1KB, c'est probablement le placeholder
    if (response.ok && contentLength && parseInt(contentLength) > 1000) {
      console.log('🖼️ Couverture Open Library trouvée')
      return coverUrl
    }
  } catch (error) {
    console.warn('Erreur vérification couverture:', error)
  }
  
  return null
}

/**
 * Google Books API
 */
const fetchFromGoogleBooks = async (isbn, query) => {
  const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=1`
  
  const response = await fetch(url)
  const data = await response.json()
  
  console.log('Google Books response:', data.totalItems, 'résultats')
  
  if (!data.items || data.items.length === 0) {
    return null
  }
  
  const book = data.items[0].volumeInfo
  
  // Récupérer la meilleure couverture disponible et vérifier qu'elle existe
  let coverUrl = null
  if (book.imageLinks) {
    // Préférer les grandes images
    const possibleCovers = [
      book.imageLinks.extraLarge,
      book.imageLinks.large,
      book.imageLinks.medium,
      book.imageLinks.thumbnail,
      book.imageLinks.smallThumbnail
    ].filter(Boolean)
    
    for (const url of possibleCovers) {
      const cleanUrl = url.replace('http://', 'https://').replace('&edge=curl', '')
      
      // Vérifier si l'image existe
      try {
        const imgResponse = await fetch(cleanUrl, { method: 'HEAD' })
        if (imgResponse.ok) {
          coverUrl = cleanUrl
          console.log('🖼️ Couverture Google Books valide:', coverUrl)
          break
        }
      } catch (e) {
        // Continuer avec la prochaine URL
      }
    }
  }
  
  return {
    title: book.title || '',
    author: book.authors ? book.authors.join(', ') : '',
    isbn: isbn,
    pageCount: book.pageCount || null,
    genre: guessGenre(book.categories),
    coverUrl: coverUrl, // Sera null si aucune couverture valide
    publishYear: book.publishedDate ? extractYear(book.publishedDate) : null,
    publisher: book.publisher || null,
  }
}

/**
 * Open Library - ISBN API directe
 */
const fetchFromOpenLibraryISBN = async (isbn) => {
  const response = await fetch(`${OPEN_LIBRARY_API}/isbn/${isbn}.json`)
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  
  const data = await response.json()
  console.log('Open Library ISBN response:', data.title)
  
  // Récupérer l'auteur
  let authorName = ''
  if (data.authors && data.authors.length > 0) {
    try {
      const authorResponse = await fetch(`${OPEN_LIBRARY_API}${data.authors[0].key}.json`)
      if (authorResponse.ok) {
        const authorData = await authorResponse.json()
        authorName = authorData.name || ''
      }
    } catch (e) {
      console.warn('Erreur récupération auteur')
    }
  }
  
  // Couverture - vérifier qu'elle existe
  let coverUrl = null
  if (data.covers && data.covers.length > 0) {
    coverUrl = `${COVERS_API}/b/id/${data.covers[0]}-L.jpg`
  }
  
  return {
    title: data.title || '',
    author: authorName,
    isbn: isbn,
    pageCount: data.number_of_pages || null,
    genre: '',
    coverUrl: coverUrl,
    publishYear: data.publish_date ? extractYear(data.publish_date) : null,
  }
}

/**
 * Open Library - Search API
 */
const fetchFromOpenLibrarySearch = async (isbn) => {
  const response = await fetch(
    `${OPEN_LIBRARY_API}/search.json?isbn=${isbn}&fields=key,title,author_name,first_publish_year,number_of_pages_median,cover_i&limit=1`
  )
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  
  const data = await response.json()
  console.log('Open Library Search response:', data.numFound, 'résultats')
  
  if (!data.docs || data.docs.length === 0) {
    return null
  }
  
  const book = data.docs[0]
  
  return {
    title: book.title || '',
    author: book.author_name ? book.author_name[0] : '',
    isbn: isbn,
    pageCount: book.number_of_pages_median || null,
    genre: '',
    coverUrl: book.cover_i 
      ? `${COVERS_API}/b/id/${book.cover_i}-L.jpg`
      : null,
    publishYear: book.first_publish_year || null,
  }
}

/**
 * Open Library - Books API (format legacy)
 */
const fetchFromOpenLibraryBooksAPI = async (isbn) => {
  const response = await fetch(
    `${OPEN_LIBRARY_API}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`
  )
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }
  
  const data = await response.json()
  const bookData = data[`ISBN:${isbn}`]
  
  console.log('Open Library Books API response:', bookData ? 'trouvé' : 'non trouvé')
  
  if (!bookData) {
    return null
  }
  
  return {
    title: bookData.title || '',
    author: bookData.authors ? bookData.authors.map(a => a.name).join(', ') : '',
    isbn: isbn,
    pageCount: bookData.number_of_pages || null,
    genre: '',
    coverUrl: bookData.cover ? (bookData.cover.large || bookData.cover.medium) : null,
    publishYear: bookData.publish_date ? extractYear(bookData.publish_date) : null,
    publisher: bookData.publishers ? bookData.publishers[0].name : null,
  }
}

/**
 * Devine le genre
 */
const guessGenre = (categories) => {
  if (!categories || !Array.isArray(categories)) return ''
  
  const genreMapping = {
    'fiction': 'Roman',
    'science fiction': 'Science-Fiction',
    'fantasy': 'Fantasy',
    'thriller': 'Thriller',
    'mystery': 'Policier',
    'detective': 'Policier',
    'crime': 'Policier',
    'biography': 'Biographie',
    'history': 'Histoire',
    'science': 'Sciences',
    'self-help': 'Développement personnel',
    'philosophy': 'Philosophie',
    'psychology': 'Psychologie',
    'computers': 'Technique',
    'comics': 'Bande dessinée',
    'manga': 'Manga',
    'juvenile': 'Jeunesse',
    'young adult': 'Jeunesse',
    'romance': 'Romance',
    'horror': 'Horreur',
    'cooking': 'Cuisine',
  }
  
  const lower = categories.map(c => c.toLowerCase())
  
  for (const [keyword, genre] of Object.entries(genreMapping)) {
    if (lower.some(c => c.includes(keyword))) {
      return genre
    }
  }
  
  return ''
}

/**
 * Extrait l'année
 */
const extractYear = (date) => {
  if (!date) return null
  const match = date.match(/\d{4}/)
  return match ? parseInt(match[0], 10) : null
}

/**
 * Recherche par titre/auteur
 */
export const searchBooks = async (query, limit = 10) => {
  try {
    const url = `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=${limit}`
    const response = await fetch(url)
    const data = await response.json()
    
    if (!data.items) return []
    
    return data.items.map(item => {
      const book = item.volumeInfo
      let coverUrl = book.imageLinks?.thumbnail?.replace('http://', 'https://') || null
      
      return {
        title: book.title || '',
        author: book.authors ? book.authors.join(', ') : '',
        isbn: book.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier || '',
        coverUrl,
        publishYear: book.publishedDate ? extractYear(book.publishedDate) : null,
      }
    })
  } catch (error) {
    console.error('Erreur recherche:', error)
    return []
  }
}

export default { fetchBookByISBN, searchBooks }