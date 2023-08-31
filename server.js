const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP

const app = express();

const {
    GraphQLSchema, 
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql')


const UserType = new GraphQLObjectType({
    name: 'A user of Stock Portfolio Tracker',
    description: "This is a user who has a password-protected account with an associated portfolio",
    fields: () => ({
        username: GraphQLNonNull(GraphQLString),
        password: GraphQLNonNull(GraphQLString),
        portfolio: {
            type: PortfolioType,
            resolve: ()
    })
})


const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "The root query",
    fields: () => ({
        users: {
            type: 
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType,
})





app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(4401, () => {console.log('server is listening to port 4401')});
