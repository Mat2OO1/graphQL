const { Pool } = require('pg');
const axios = require('axios');

// Create a connection pool to the database
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'graphql_todo',
    password: 'password',
    port: 5432,
});


//Connect to the new database and create the tables
pool.connect()
    .then(client => {
        return client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        login TEXT NOT NULL UNIQUE
      );

      CREATE TABLE todos (
        id SERIAL PRIMARY KEY,
        userId INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT false
      );
    `)
            .then(() => {
                console.log('Tables created.');
                client.release();
            })
            .catch(error => {
                console.error(error);
                client.release();
            });
    })
    .catch(error => {
        console.error(error);
    });

// // Fetch users from the API and insert them into the database
axios.get('https://jsonplaceholder.typicode.com/users')
    .then(response => {
        const users = response.data;

        users.forEach(user => {
            pool.query('INSERT INTO users (name, email, login) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [user.name, user.email, user.username])
                .catch(error => console.error(error));
        });
    })
    .catch(error => console.error(error));

// Fetch todos from the API and insert them into the database
axios.get('https://jsonplaceholder.typicode.com/todos')
    .then(response => {
        const todos = response.data;

        todos.forEach(todo => {
            pool.query('INSERT INTO todos (userId, title, completed) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING', [todo.userId, todo.title, todo.completed])
                .catch(error => console.error(error));
        });
    })
    .catch(error => console.error(error));
