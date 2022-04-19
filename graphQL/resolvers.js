const Author = require("../models/author");
const Book = require("../models/book");

const resolvers = {
  Query: {
    allBooks: async (root, args) => {
      let filteredBooks = await Book.find({});

      if (args.author) {
        filteredBooks = filteredBooks.filter(
          (book) => book.author.name === args.author
        );
      }

      if (args.genre) {
        filteredBooks = filteredBooks.filter((book) =>
          book.genres.includes(args.genre)
        );
      }

      return filteredBooks;
    },

    allAuthors: async () => Author.find({}),
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
  },
  Author: {
    bookCount: async (root) =>
      Book.collection.countDocuments({ author: root.id }),
  },
  Book: {
    author: async (root) => {
      const author = await Author.findById(root.author);
      return {
        id: author.id,
        name: author.name,
        born: author.born,
      };
    },
  },

  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });

      if (!author) {
        author = new Author({ name: args.author });
        author = await author.save();
      }

      const newBook = new Book({ ...args, author: author.id });
      const savedBook = await newBook.save();

      return savedBook;
    },

    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;

      return author.save();
    },
  },
};

module.exports = resolvers;
