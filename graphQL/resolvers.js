require("dotenv").config();
const { UserInputError, AuthenticationError } = require("apollo-server");
const Author = require("../models/author");
const Book = require("../models/book");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { PubSub } = require("graphql-subscriptions");
const pubsub = new PubSub();

const JWT_SECRET = process.env.JWT_SECRET;

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
    me: async (root, args, context) => context.currentUser,
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
    addBook: async (root, args, context) => {
      let author = await Author.findOne({ name: args.author });

      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated");
      }

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

      pubsub.publish("BOOK_ADDED", { bookAdded: newBook });

      return newBook;
    },

    editAuthor: async (root, args, context) => {
      let author = await Author.findOne({ name: args.name });
      author.born = args.setBornTo;

      if (!context.currentUser) {
        throw new AuthenticationError("not authenticated");
      }

      try {
        author = await author.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      }

      return author;
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
      });

      return user.save().catch((error) => {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        });
      });
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        // TODO - change later
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
