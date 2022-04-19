const { UserInputError } = require("apollo-server");
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
    bookCount: async (root) => {
      const books = await Book.find({ author: root.id });
      return books.length;
    },
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

      let newBook = new Book({
        title: args.title,
        published: args.published,
        genres: args.genres,
        author,
      });

      try {
        newBook = await newBook.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      return newBook;
    },

    editAuthor: async (root, args) => {
      let author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;

      try {
        author = await author.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      return author;
    },
  },
};

module.exports = resolvers;
