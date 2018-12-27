const graphql = require('graphql')
const axios = require('axios');

const {
	GraphQLObjectType,
	GraphQLString,
	GraphQLInt,
	GraphQLSchema,
	GraphQLList,
	GraphQLNonNull
} = graphql;


const ProductType = new GraphQLObjectType({

	name: 'Product',
	fields: () => ({
		id: { type: GraphQLString },
		name: { type: GraphQLString },
		description: { type: GraphQLString },
		customers: {
			type: new GraphQLList(CustomerType),
			resolve(parentValue, args) {
				console.log(parentValue, args)
				//****** /products/${parentValue.id}/customers
				return axios.get(`http://localhost:3000/products/${parentValue.id}/customers`)
				.then(res => res.data)
			}
		}
	})

});

const CustomerType = new GraphQLObjectType({

	name: 'Customer',
	fields: () => ({

		id:{ type: GraphQLString },
		firstName: { type: GraphQLString },
		lastName: {type: GraphQLString},
		gender: {type:GraphQLString},
		age: {type: GraphQLInt},
		product: {
			type: ProductType,
			resolve(parentValue, args) {
				console.log(parentValue, args, 'ddddddddddddddddddddd')
				return axios.get(`http://localhost:3000/products/${parentValue.productId}`)
				.then(res => res.data)
			}
		}
	})
});

const RootQuery = new GraphQLObjectType({
	name: 'RootQueryType',
	fields: {
		customer:{

			type: CustomerType, 
			args: {id: {type:GraphQLString}},
			resolve(parentValue, args) {
				console.log(parentValue, args)
				return axios.get(`http://localhost:3000/customers/${args.id}`)
				.then(response =>  response.data);
			}
		},
		product: {

			type: ProductType,
			args: {id: {type: GraphQLString}},
			resolve(parentValue, args) {

				console.log(parentValue, args)
				return axios.get(`http://localhost:3000/products/${args.id}`)
				.then(response => response.data)
			}
		}
	}
})

const mutation =  new GraphQLObjectType({

	name: 'Mutation',
	fields: () => ({

		/*
			[Post] 

			mutation {
			  addCustomer(firstName: "David", lastName: "Mac", age: 34, productId: "3", gender: "m") {
			    firstName
			    lastName
			    age
			    gender
			    product {
			      name
			      description
			    }
			    
			  }
			}

		*/
		addCustomer: {

			type: CustomerType,
			args: {
				firstName: {type: new GraphQLNonNull(GraphQLString)},
				lastName: {type: new GraphQLNonNull(GraphQLString)},
				gender: {type: new GraphQLNonNull(GraphQLString)},
				age: {type: new GraphQLNonNull(GraphQLInt)},
				productId: {type: new GraphQLNonNull(GraphQLString)}

			},
			resolve(parentValue, {firstName, lastName, gender, age, productId}) {
				return axios.post(`http://localhost:3000/customers`, {firstName, lastName, gender, age, productId})
				.then(res => res.data);
			}	
		},


		/*

				mutation {
				  deleteCustomers(id: "a~ovZhb") {
				    lastName
				  }
				}


		*/

		deleteCustomers: {
			type: CustomerType,
			args: { id: {type: new GraphQLNonNull(GraphQLString)}},
			resolve(parentValue, {id}) {
				return axios.delete(`http://localhost:3000/customers/${id}`)
				.then(res => res.data);
			}
		},

		/*

			mutation {
		  editCustomers(id: "12", productId: "3", age: 34) {
		    firstName
		    lastName
		    age
		    gender
		    product {
		      name
		      description
		    }
		  }
		}

		*/
		editCustomers: {
			type: CustomerType,
			args: {
				id: {type: new GraphQLNonNull(GraphQLString)},
				firstName: {type: GraphQLString },
				lastName: {type: GraphQLString },
				age: {type: GraphQLInt },
				gender: {type: GraphQLString },
				productId: {type: GraphQLString }
			},
			resolve( parentValue, args) {
				return axios.patch(`http://localhost:3000/customers/${args.id}`, args)
				.then(res => res.data);
			}
		}

	})

});

module.exports = new GraphQLSchema ({
	query: RootQuery,
	mutation
});

/*
query fetchData {
  
  fetProduct: product (id: "2") {
    id
    name
    description
    customers {
      id
      firstName
      gender
      age
      product{
        name
        description
      }
    }
    
  },
  
  fetchCustomer : customer(id: "12") {
      age
      firstName
      lastName
    	product {
        name
      }
  }
}

*/

/*
[Dry up]

query {
  
  fetProduct: product (id: "2") {
    ...productDetails
    
    customers {
      ...customerDetails
      product{
        ...productDetails
      }
    }
    
  },
  
  fetchCustomer : customer(id: "12") {
      ...customerDetails
    	product {
        ...productDetails
      }
  }
}

fragment customerDetails on Customer {
  id
  age
  gender
  firstName
  lastName
}

fragment productDetails on Product{
  
  id
  name
  description
  
}
*/