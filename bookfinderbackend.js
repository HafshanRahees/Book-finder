// backend/index.js
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// Search books from Open Library
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  try {
    const response = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`);
    const data = await response.json();

    const books = data.docs.slice(0, 10).map(book => ({
      key: book.key,
      title: book.title,
      author: book.author_name?.[0] || 'Unknown',
      cover: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : ''
    }));

    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

// Get book description/content
app.get('/api/book', async (req, res) => {
  const bookKey = req.query.key;
  try {
    const response = await fetch(`https://openlibrary.org${bookKey}.json`);
    const data = await response.json();

    const description = typeof data.description === 'string' ? data.description : data.description?.value;
    const content = description || 'No content available for preview.';

    res.json({ content });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load book content' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
