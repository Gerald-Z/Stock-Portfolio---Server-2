const {authenticateUser, retrievePortfolio, createUser, updatePosition, deletePosition, deleteProfile} = require('./pg.js');


const express = require('express');
const expressGraphQL = require('express-graphql').graphqlHTTP

const app = express();

const {
    GraphQLSchema, 
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNum,
    GraphQLNonNull,
} = require('graphql')


const UserType = new GraphQLObjectType({
    name: 'A user of Stock Portfolio Tracker',
    description: "This is a user who has a password-protected account with an associated portfolio",
    fields: () => ({
        username: {type: GraphQLNonNull(GraphQLString)},
        password: {type: GraphQLNonNull(GraphQLString)},
        portfolio: {type: GraphQLList(PositionType)}
    })
})

const PositionType = new GraphQLObjectTyle({
    name: "A user's portfolio",
    description: "This represents a user's portfolio",
    fields: () => ({
        ticker: {type: GraphQLNonNull(GraphQLString)},
        share: {type: GraphQLNonNull(GraphQLNum)},
        value: {type: GraphQLNonNull(GraphQLNum)},
        cost: {type: GraphQLNonNull(GraphQLNum)}
    })      
})

const RootQueryType = new GraphQLObjectType({
    name: "Query",
    description: "The root query",
    
    fields: () => ({
        user: {type: GraphQLList(UserType)},
        description: `Retrieve a user's portfolio based on username`,
        args: {
            username: {type: GraphQLNonNull(GraphQLString)},
            password: {type: GraphQLNonNull(GraphQLString)}
        },
        resolve: (parent, args) => {
            if (authenticateUser(args.username, args.password)) {
                return retrievePortfolio(args.username, args.password);
            } 
        }
    })
})



// Mutations: GraphQL's version of POST, PUT, and DELETE
const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: "Root Mutation",
    fields: () => ({
        create_user: {
            type: null,
            description: `Creates a user's profile`,
            args: {
                username: {type: GraphQLNonNull(GraphQLString)},
                password: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                createUser(args.username, args.password);
            }
        },
        modify_position: {
            type: null,
            description: `Modifies a user's position`,
            args: {
                username: {type: GraphQLNonNull(GraphQLString)},
                password: {type: GraphQLNonNull(GraphQLString)},
                order: {type: GraphQLNonNull(GraphQLString)},
                ticker: {type: GraphQLNonNull(GraphQLString)},
                share: {type: GraphQLNonNull(GraphQLNum)},
                value: {type: GraphQLNonNull(GraphQLNum)},
                cost: {type: GraphQLNonNull(GraphQLNum)}                
            },
            resolve: (parent, args) => {
                updatePosition(args.username, args.password, args.order, args.ticker, args.share, args.value, args.cost);
            }
        },
        delete_profile: {
            type: null,
            description: `Deletes a user's profile`,
            args: {
                username: {type: GraphQLNonNull(GraphQLString)},
                password: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                if (authenticateUser(args.username, args.password)) {
                    return deleteProfile(args.username, args.password);
                } 
            }
        },
        delete_position: {
            type: null,
            description: `Deletes a user's position`,
            args: {
                username: {type: GraphQLNonNull(GraphQLString)},
                password: {type: GraphQLNonNull(GraphQLString)},
                ticker: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve: (parent, args) => {
                if (authenticateUser(args.username, args.password)) {
                    return deletePosition(args.username, args.password, args.ticker);
                } 
            }
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

