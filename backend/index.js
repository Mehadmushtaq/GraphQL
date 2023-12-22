import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Todos } from './dataSet/todos.js';
import { Users } from './dataSet/users.js';

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed
// against your data.

const typeDefs = `
    #graphql string

    type Todo {
        userId: Int
        id: Int
        title: String
        completed: Boolean
        user: User
    }

    type User {
        id : Int
        name: String
        username: String
        email: String
        phone: String
        website: String
        todos : [Todo]                   # user can have multiple todos
    }

    type Query {
        todos: [Todo]
        users: [User]
    }

    type Mutation {
        addTodo(title: String!, userId: Int!): Todo
        updateUser(id: Int!, name: String!): User
        deleteTodo(id: Int!): Boolean
      }
`;
// Function to generate a unique todo ID
function getNextTodoId() {
  return Todos.length > 0 ? Math.max(...Todos.map((todo) => todo.id)) + 1 : 1;
}

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
  Query: {
    todos: () =>
      Todos.map((todo) => ({
        ...todo,
        user: Users.find((user) => user.id === todo.userId),
      })),
    users: () => Users,
  },
  Mutation: {
    addTodo: (_, { title, userId }) => {
      const newTodo = { id: getNextTodoId(), title, userId, completed: false };
      Todos.push(newTodo);
      return newTodo;
    },
    updateUser: (_, { id, name }) => {
      const userIndex = Users.findIndex((user) => user.id === id);
      if (userIndex !== -1) {
        Users[userIndex].name = name;
        return Users[userIndex];
      }
      return null;
    },
    deleteTodo: (_, { id }) => {
      const todoIndex = Todos.findIndex((todo) => todo.id === id);
      if (todoIndex !== -1) {
        Todos.splice(todoIndex, 1);
        return true;
      }
      return false;
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
