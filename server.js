const cors = require('cors');
const express = require('express')
const {graphqlHTTP} = require('express-graphql')
const graphql = require('graphql')
const joinMonster = require('join-monster')


const { Client } = require('pg')
const client = new Client({
  host: "localhost",
  user: "postgres",
  password: "postgres",
  database: "rumble"
})
client.connect()

const Teams = new graphql.GraphQLObjectType({
  name: 'Teams',
  extensions: {
    joinMonster: {
      sqlTable: 'rumble',
      uniqueKey: 'id'
    }
  },
  fields: () => ({
    teams: {
      teamOne: {},
      teamTwo: {},
      teamThree: {}
    }
  })
});

const Rumble = new graphql.GraphQLObjectType({
  name: 'Rumble',
  extensions: {
    joinMonster: {
      sqlTable: 'rumble',
      uniqueKey: 'id'
    }
  },
  fields: () => ({
    id: { type: graphql.GraphQLString },
    // teams: {type: Teams}
  })
});

Rumble._typeConfig = {
  sqlTable: 'rumble',
  uniqueKey: 'id',
}


const QueryRoot = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    rumbles: {
      type: new graphql.GraphQLList(Rumble),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
      }
    },
    teams: {
      type: new graphql.GraphQLList(Rumble),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, sql => {
          return client.query(sql)
        })
      }
    }
  })
})

const MutationRoot = new graphql.GraphQLObjectType({
  name: 'Mutation',
  fields: () => ({
    rumble: {
      type: Rumble,
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)}
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("INSERT INTO rumble(id) VALUES ($1) RETURNING *", [args.id])).rows[0]
        } catch (err) {
          throw new Error("Failed to create rumble")
        }
      }
    }
    // teams: {
    //   type: Rumble,
    //   args: {
    //     id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
    //     teams: {type: new graphql.GraphQLList(Teams)}
    //   },
    //   resolve: async (parent, args, context, resolveInfo) => {
    //     try {
    //       return (await client.query("INSERT INTO rumble(teams) VALUES ($args.teams) RETURNING *", [args.teams])).rows[0]
    //     } catch (err) {
    //       throw new Error("Failed to create rumble")
    //     }
    //   }
      // type: Teams,
      // args: {
      //   id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
      //   teams: { }
      // },
      // resolve: async (parent, args, context, resolveInfo) => {
      //   try {
      //     return (await client.query("INSERT INTO rumble(id) VALUES ($teams) RETURNING *", [args.id, args.teams]))
      //   } catch (err) {
      //     throw new Error("Failed to assign teams")
      //   }
      // }
    // }
  })
})


const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
  mutation: MutationRoot
});

const port = process.env.PORT || 4000

const app = express();
app.use('/api', cors(), graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
app.listen(port);


