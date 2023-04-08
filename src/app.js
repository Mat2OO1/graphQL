const { GraphQLServer } = require('graphql-yoga');
const axios = require('axios');

// Define your GraphQL schema
const typeDefs = 'schema.graphql'

// Define your GraphQL resolvers
const resolvers = {
    User: {
        todos: async (parent) => {
            const response = await axios.get(`https://jsonplaceholder.typicode.com/todos?userId=${parent.id}`);
            return response.data;
        },
    },
    Todo: {
        user: async (parent) => {
            const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${parent.userId}`);
            return response.data;
        },
    },
    Query: {
        user: async (_, { id }) => {
            const response = await axios.get(`https://jsonplaceholder.typicode.com/users/${id}`);
            return response.data;
        },
        users: async () => {
            const response = await axios.get(`https://jsonplaceholder.typicode.com/users`);
            return response.data;
        },
        todo: async (_, { id }) => {
            const response = await axios.get(`https://jsonplaceholder.typicode.com/todos/${id}`);
            return response.data;
        },
        todos: async () => {
            const response = await axios.get(`https://jsonplaceholder.typicode.com/todos`);
            return response.data;
        },
    },
};

// Create a GraphQL server
const server = new GraphQLServer({ typeDefs, resolvers });

// Start the server
server.start(() => console.log('Server is running on http://localhost:4000'));
