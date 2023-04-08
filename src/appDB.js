const {Pool} = require('pg');
const {GraphQLServer} = require('graphql-yoga');

const typeDefs = 'schemaDB.graphql';
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'graphql_todo',
    password: 'password',
    port: '5432',
});

const resolvers = {
    User: {
        todos: async (parent) => {
            const {rows} = await pool.query(`SELECT * FROM todos WHERE userid = $1`, [parent.id]);
            return rows;
        },
    },
    Todo: {
        user: async (parent) => {
            const {rows} = await pool.query(`SELECT * FROM users WHERE id = $1`, [parent.userid]);
            return rows[0];
        },
    },
    Query: {
        user: async (_, {id}) => {
            const {rows} = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
            return rows[0];
        },
        users: async () => {
            const {rows} = await pool.query(`SELECT * FROM users`);
            return rows;
        },
        todo: async (_, {id}) => {
            const {rows} = await pool.query(`SELECT * FROM todos WHERE id = $1`, [id]);
            console.log(rows)
            return rows[0];
        },
        todos: async () => {
            const {rows} = await pool.query(`SELECT * FROM todos`);
            return rows;
        },
    },
    Mutation: {
        addTodo: async (_, {userid, title, completed}) => {
            const {rows} = await pool.query(
                `INSERT INTO todos (userId, title, completed) VALUES ($1, $2, $3) RETURNING *`,
                [userid, title, completed]
            );
            return rows[0];
        },
        editTodo: async (_, {id,userid, title, completed}) => {
            const {rows} = await pool.query(
                `UPDATE todos SET userId = $1, title = $2, completed = $3 WHERE id = $4 RETURNING *`,
                [userid, title, completed, id]
            );
            return rows[0];
        },
        deleteTodo: async (_, {id}) => {
            const {rows} = await pool.query(`DELETE FROM todos WHERE id = $1 RETURNING *`, [id]);
            return rows[0];
        },
        addUser: async (_, {name, email, username}) => {
            const {rows} = await pool.query(
                `INSERT INTO users (name, email, username) VALUES ($1, $2, $3) RETURNING *`,
                [name, email, username]
            );
            return rows[0];
        },
        deleteUser: async (_, {id}) => {
            const {rows} = await pool.query(
                `DELETE FROM users WHERE id = $1 RETURNING *`,
                [id]
            );
            return rows[0];
        },
        editUser: async (_, {id, name, email, username}) => {
            let updateQuery = `UPDATE users SET `;
            const updateValues = [];
            let valueIndex = 1;
            if (name) {
                updateQuery += `name = $${valueIndex}, `;
                updateValues.push(name);
                valueIndex++;
            }
            if (email) {
                updateQuery += `email = $${valueIndex}, `;
                updateValues.push(email);
                valueIndex++;
            }
            if (username) {
                updateQuery += `username = $${valueIndex}, `;
                updateValues.push(username);
                valueIndex++;
            }
            updateQuery = updateQuery.slice(0, -2); // remove trailing comma and space
            updateQuery += ` WHERE id = $${valueIndex} RETURNING *`;
            updateValues.push(id);

            const {rows} = await pool.query(updateQuery, updateValues);
            return rows[0];
        }
    }
};

const server = new GraphQLServer({typeDefs, resolvers});


server.start(() => console.log('Server is running on http://localhost:4000'));

