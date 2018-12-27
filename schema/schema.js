const graphql = require('graphql');
// const _ = require('lodash');

const axios = require('axios');

// be careful about spelling
const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema, // takes in query result as instance
	GraphQLList,
	GraphQLNonNull
} = graphql;


// const users = [
// 	{id: '23', firstName: 'Bill', age: 21 },
// 	{id: '47', firstName: 'Samantha', age: 23 }	
// ]

const CompanyType = new GraphQLObjectType({

	name: 'Company',
	// return () => ()
	fields: () => ({
		id: {
			type: GraphQLString
		},
		name: {
			type: GraphQLString
		},
		description: {
			type: GraphQLString
		},
		users: {
				// way to bidirectiontional user <-- company
				// one to many (one company and manuy associtated users) new GraphQLList (UserType)
				type: new GraphQLList(UserType), // UserType (x), 
				resolve(parentValue, args) {
					console.log('parentValue; ', parentValue, ' args: ', args)
					return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
						.then(res => res.data);
				}
		}
	})
});


const UserType = new GraphQLObjectType({

	name: 'User',
	fields: () => ({
		// gotta define data type here.
		// It is a built-in type in graphql
		id: {
			type: GraphQLString
		},
		firstName: {
			type: GraphQLString
		},
		age: {
			type: GraphQLInt
		},
		// no 's' because it is one to one relationship
		company: {

			// association with other collection
			// one to one relationship. one user must have onlye one company.
			type: CompanyType,
			resolve(parentValue, args) {
				console.log('userParentValue: ', parentValue, ' args: ', args);
				return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
					.then(res => res.data)
			}
		}
	})
});

// Query at GraphiQL

/*
	{ 
  user(id: "23") {
    id
    firstName
    age
  }
}

*/
const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {

		// user : defines object name
		// ********* It is used to query data
		user: {

			// (2) return UserType schema //UserType : defines target
			type: UserType,

			// (1) try to find data based on id with its type
			args: {
				id: {
					type: GraphQLString
				}
			},

			// (3) promise when the data exist
			resolve(parentValue, args) {

				// (1) by using lodash for local data in this file
				// return _.find(users, {id: args.id }) // uses lodash

				// just in case, if we want all data, we can use url = 'http://localhost:3000/users' 
				//		without 'args

				// (2) by using axios to fetch outside data
				// "users" :collection name in db.json
				return axios.get(`http://localhost:3000/users/${args.id}`)
					.then(response => response.data);
			}
		},
		// additional direct query. 
		company: {

			type: CompanyType,
			args: {
				id: {
					type: GraphQLString
				}
			},
			// just in case, if we want all data, we can use url = 'http://localhost:3000/companies' 
				//		without 'args
			resolve(parentValue, args) {
				return axios.get(`http://localhost:3000/companies/${args.id}`)
					.then(res => res.data);
			}
		}
	}
})


// Mutation : data manipulation! (GraphQL : query and mutation)
const mutation = new GraphQLObjectType({
	name: 'Mutation',
	fields: () => ({

		// mutation name should be unique!
		// call UserType and user collection
		/*
		GraphiQL

		mutation {
		  addUser(firstName: "Steven", age: 26) {

		  	// define "response about post"
		  	// id is automatically defined in json server
		    id
		    firstName
		    age
		  }
		}
		===================================
		{
		  "data": {
		    "addUser": {
		      "id": "wzEvaYl",
		      "firstName": "Steven",
		      "age": 26
		    }
		  }
		}


		*/
		addUser: {
			// remind again! "type" defines "return" type
			// When mutations, return type might be not consistent with "addUser" 
			type: UserType,
			args: {
				firstName: {
					type: new GraphQLNonNull(GraphQLString)
				},
				age: {
					type: new GraphQLNonNull(GraphQLInt)
				}, // GraphQLNonNull => "required"
				companyId: {
					type: GraphQLString
				}
			},
			resolve(parentValue, {
				firstName,
				age
			}) {

				return axios.post(`http://localhost:3000/users`, {
						firstName,
						age
					})
					.then(res => res.data)

			}
		},

		/*
			
			mutation {
			  deleteUser(id: "23") {
			    id
			  }
			}


			==> retun
			 {
			  "data": {
			    "deleteUser": {
			      "id": null  ===> no return
			    }
			  }
			}
			
		*/
		deleteUser: {
			type: UserType,
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLString)
				}
			},

			// by default, json server does not return deleted value / not like mongoDB
			resolve(parentValue, {
				id
			}) {
				// console.log(typeof id)

				// think about express delete /users/${idf}
				return axios.delete(`http://localhost:3000/users/${id}`)
					.then(res => res.data)
			}
		},

		// patch vs put
		// patch is updating the part of the collectioin
		// In the other hand, put is replacing full collection.

		/*

			mutation {
   		    editUser(id:"35", age: 10) {
			    id
			    age
			    firstName
		    }

		    ==> return


		  {
		  "data": {
		    "editUser": {
		      "id": "35",
		      "age": 10,
		      "firstName": "Samantha"
		    }
		   }
		   }

		}

		*/

		// it return collection value.
		editUser: {
			type: UserType,
			args: {
				id: {
					type: new GraphQLNonNull(GraphQLString)
				},
				firstName: {
					type: GraphQLString
				},
				age: {
					type: GraphQLInt
				}, // GraphQLNonNull => "required"
				companyId: {
					type: GraphQLString
				}
			},
			//resolve(parentValue, {id, firstName, age, companyId}) {
			resolve(parentValue, args) {

				// id for updating will be ignored in json serverr. Just for clear.
				return axios.patch(`http://localhost:3000/users/${args.id}`, args)
					.then(res => res.data)
			}
		}

	})
})


module.exports = new GraphQLSchema({
	query: RootQuery,
	mutation
});


/*

At graphiQL...
Simple syntax about query.

1. "query" to separate it from other command
2. "object name: findCompany" it can be used to fetch
	in frontend

query findCompany{ 

  // apple, google => is a "key" required 
  // to fetch same collections
  apple: company(id: "1") {
    ...companyDetails
    users {
      ...userDetails
    }
  }
  google: company(id: "2") {
    ...companyDetails
    users {
       ...userDetails
    }
  }
}

// fragment to dry up the codes
// and eventually avoid the repetative codes
fragment companyDetails on Company {
  id
  name
  description
}

fragment userDetails on User {
  id
  firstName
  age
}
*/