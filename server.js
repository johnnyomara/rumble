const {createServer} = require('http')
const {ApolloServer} = require('@apollo/server')
const {ApolloServerPluginDrainHttpServer} = require('@apollo/server/plugin/drainHttpServer')
const {makeExecutableSchema} = require('@graphql-tools/schema')
const {WebSocketServer} = require('ws')
const {useServer} = require('graphql-ws/lib/use/ws')
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
    teams: { type: new graphql.GraphQLList(Teams) },
  })
});

Rumble._typeConfig = {
  sqlTable: 'rumble',
  uniqueKey: 'id',
}

const Teams = new graphql.GraphQLObjectType({
  name: 'Teams',
  extensions: {
    joinMonster: {
      sqlTable: 'teams',
      uniqueKey: 'teamid'
    }
  },
  fields: () => ({
    id: { type: graphql.GraphQLInt},
    number: { type: graphql.GraphQLInt},
    teamid: { type: graphql.GraphQLInt},
    name: { type: graphql.GraphQLString},
    eliminated: { type: graphql.GraphQLBoolean},
    wrestlerid: { type: graphql.GraphQLInt},
    //ADD ELIMINATES AND ELIMINATED
    wrestlers: { type: new graphql.GraphQLList(Wrestler) },
    rumble: {type: Rumble}
  })
})

Teams._typeConfig = {
  sqlTable: 'teams',
  uniqueKey: 'id',
}

const Wrestler = new graphql.GraphQLObjectType({
  name: 'Wrestler',
  extensions: {
    joinMonster: {
      sqlTable: 'Wrestlers',
      uniqueKey: 'id'
    }
  },
  fields: () => ({
    wrestlerid: { type: graphql.GraphQLInt },
    number: { type: graphql.GraphQLInt},
    teamid: { type: graphql.GraphQLInt},
    team: {type: Teams},
    name: { type: graphql.GraphQLString },
    eliminated: { type: graphql.GraphQLBoolean },
    eliminates: { type: new graphql.GraphQLList(graphql.GraphQLInt) },
    eliminatedby: { type: new graphql.GraphQLList(graphql.GraphQLInt) },
    id: { type: graphql.GraphQLInt}
  })
})

Wrestler._typeConfig = {
  sqlTable: 'wrestler',
  uniqueKey: 'id',
}


const QueryRoot = new graphql.GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    rumble: {
      type: new graphql.GraphQLList(Rumble),
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        // team: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)}
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("SELECT * FROM rumble WHERE id = ($1)", [args.id])).rows
        }
        catch {
          throw new Error('failed to fetch game')
        }
      }
    },
    teams: {
      type: new graphql.GraphQLList(Teams),
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        // team: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)}
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("SELECT * FROM teams WHERE id = ($1)", [args.id])).rows
        }
        catch {
          throw new Error('failed to fetch teams')
        }
      }
    },
    team: {
      type: new graphql.GraphQLList(Teams),
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("SELECT * FROM wrestler WHERE teamid = ($1) ", [args.id])).rows
        }
        catch {
          throw new Error('failed to fetch teams')
        }
      }
    },
    wrestlers: {
      type: new graphql.GraphQLList(Wrestler),
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        // team: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)}
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("SELECT * FROM wrestler WHERE wrestlerid = ($1)", [args.id])).rows
        }
        catch {
          throw new Error('failed to fetch wrestlers')
        }
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
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("INSERT INTO rumble(id) VALUES ($1) RETURNING *", [args.id])).rows[0]
        } catch (err) {
          throw new Error("Failed to create rumble")
        }
      }
    },
    teams: {
      type: Teams,
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        number: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        teamid: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        // wrestlers: { type: {Wrestler} }
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("INSERT INTO teams(id, number, teamid) VALUES ($1, $2, $3) RETURNING *", [args.id, args.number, args.teamid])).rows[0]
        } catch (err) {
          throw new Error("Failed to create teams")
        }
      }
    },
    wrestlers: {
      type: Wrestler,
      args: {
        wrestlerid: { type: graphql.GraphQLInt },
        number: { type: graphql.GraphQLInt },
        teamid: { type: graphql.GraphQLInt },
        id: { type: graphql.GraphQLInt},
        name: { type: graphql.GraphQLString },
        eliminated: { type: graphql.GraphQLBoolean },
        eliminates: { type: graphql.GraphQLInt },
        eliminatedby: { type: graphql.GraphQLInt },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("INSERT INTO wrestler(wrestlerid, number, teamid, id, name, eliminated, eliminates, eliminatedBy) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *", [args.wrestlerid, args.number, args.teamid, args.id, args.name, args.eliminated, args.eliminates, args.eliminatedby])).rows[0]
        } catch (err) {
          throw new Error("Failed to create wrestlers")
        }
      }
    },
    wrestler: {
      type: Wrestler,
      args: {
        wrestlerid: { type: graphql.GraphQLInt },
        // number: { type: graphql.GraphQLInt },
        // teamid: { type: graphql.GraphQLInt },
        // id: { type: graphql.GraphQLInt},
        name: { type: graphql.GraphQLString },
        // eliminated: { type: graphql.GraphQLBoolean },
        // eliminates: { type: graphql.GraphQLInt },
        // eliminatedby: { type: graphql.GraphQLInt },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.mutation("UPDATE wrestler(name) VALUES ($1) WHERE wrestlerid VALUES ($2) RETURNING *", [args.name, args.wrestlerid])).rows[0]
        } catch (err) {
          throw new Error("Failed to update wrestler")
        }
      }
    }
  })
})

const SubscriptionRoot = new graphql.GraphQLObjectType({
  name: 'Subscription',
  fields: () => ({
    wrestlers: {
      type: new graphql.GraphQLList(Wrestler),
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("SELECT * FROM wrestler WHERE id = ($1)", [args.id])).rows
        }
        catch {
          throw new Error('failed to fetch wrestlers')
        }
      }
    }
  })
})



// const Subscription = {
//   wrestlerUpdated: Wrestler
// }


const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
  mutation: MutationRoot,
  subscription: SubscriptionRoot
});

const port = process.env.PORT || 4000

const app = express();
const httpServer = createServer(app);
const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/api',
});

const serverCleanup = useServer({ schema }, wsServer);

const server = new ApolloServer({
  schema,
  plugins: [
    ApolloServerPluginDrainHttpServer({ httpServer }),

    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

app.use('/api', cors(), graphqlHTTP({
  schema: schema,
  graphiql: true,
}));
httpServer.listen(port);



