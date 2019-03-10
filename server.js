const express = require('express');

// glue or compatibility layer between express and graphql
// Variable name must be as followed. It is strict.
const expressGraphQL = require('express-graphql');
const app = express();

const schema = require('./schema/schema');

// working as m/w (it is used in dev envronment)
app.use('/graphql', expressGraphQL({

	schema,
	graphiql: true

}));

app.listen(4000, () => {

	console.log('listening at 4000');

});