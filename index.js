const express = require('express');
const expressGraphQL= require('express-graphql');

const schema =  require('./schema/schema_pra');

const app = express();

app.use('/graphql_pra', expressGraphQL({
	schema,
	graphiql: true

}));

app.listen(4500, () => {
	console.log('listening at 4500 Practice');
});


