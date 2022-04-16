const { v1: uuid } = require("uuid");
const Author = require("../models/author");
const Book = require("../models/book");

const resolvers = {
  Query: {
    allBooks: async (root, args) => {
      // filters missing
      /*let filteredBooks = books;
      if (args.author) {
        filteredBooks = filteredBooks.filter((b) => b.author === args.author);
      }

      if (args.genre) {
        filteredBooks = filteredBooks.filter((b) =>
          b.genres.includes(args.genre)
        );
      }
      */

      return Book.find({});
    },
    allAuthors: async () => Author.find({}),
    bookCount: async () => Book.collection.countDocuments(),
    authorCount: async () => Author.collection.countDocuments(),
  },
  Author: {
    bookCount: async (root) => Book.collection.countDocuments(),
  },
  Mutation: {
    addBook: async (root, args) => {
      let author = await Author.findOne({ name: args.author });
      if (!author) {
        author = new Author({ name: args.author });
        await author.save();
      }
      const newBook = new Book({ ...args, author: author.id });
      console.log(newBook);
      const savedBook = await newBook.save();
      console.log(savedBook);

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
