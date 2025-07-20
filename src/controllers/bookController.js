const axios = require('axios');
const Book = require('../models/Book');

/*                     ----------  CREATE  ----------                */
exports.addBook = async (req, res) => {
  try {
    const { title, author, genre, status } = req.body;

    const book = new Book({
      title,
      author,
      genre,
      status,
      coverImage: req.files?.coverImage?.[0]?.path || null,
      file: req.files?.file?.[0]?.path || null,
      user: req.userId
    });

    await book.save();
    res.status(201).json(book);
  } catch (err) {
    console.error('AddBook error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/*                        ----------  READ ALL  ----------                  */
exports.getBooks = async (req, res) => {
  try {
    const { status, author, title } = req.query;
    const query = { user: req.userId };

    if (status) query.status = status;
    if (author) query.author = new RegExp(author, 'i');
    if (title) query.title = new RegExp(title, 'i');

    const books = await Book.find(query).sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    console.error('GetBooks error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/*                  ----------  GET SINGLE BOOK  ----------                      */
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findOne({ _id: req.params.id, user: req.userId });
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    console.error('GetBook error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/*                   ----------  UPDATE  ----------                    */
exports.updateBook = async (req, res) => {
  try {
    const { title, author, genre, status } = req.body;
    const book = await Book.findOne({ _id: req.params.id, user: req.userId });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.status = status || book.status;

    if (req.files?.coverImage?.[0]) {
      book.coverImage = req.files.coverImage[0].path;
    }

    if (req.files?.file?.[0]) {
      book.file = req.files.file[0].path;
    }

    await book.save();
    res.json(book);
  } catch (err) {
    console.error('UpdateBook error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/*                 ----------  DELETE  ----------                 */
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findOneAndDelete({ _id: req.params.id, user: req.userId });

    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }

    res.json({ message: 'Book removed' });
  } catch (err) {
    console.error('DeleteBook error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/*            ----------  GOOGLE BOOKS API SEARCH  ---------- */
exports.searchGoogleBooks = async (req, res) => {
  try {
    const { query } = req.params;

    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_BOOKS_API_KEY}`
    );

    const books = (response.data.items || []).map(item => ({
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Unknown',
      genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : 'Unknown',
      coverImage: item.volumeInfo.imageLinks?.thumbnail || null,
    }));

    res.json(books);
  } catch (err) {
    console.error('GoogleBooksSearch error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
