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
      uniqueKey: 'wrestlerid'
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
    id: {type: new graphql.GraphQLList(graphql.GraphQLInt)}
  })
})

Wrestler._typeConfig = {
  sqlTable: 'wrestler',
  uniqueKey: 'id',
}

// const game = new graphql.GraphQLObjectType({
//   id: { type: Rumble.id},
//   team: Teams
// })


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
    wrestlers: {
      type: new graphql.GraphQLList(Wrestler),
      args: {
        id: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)},
        // team: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt)}
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("SELECT * FROM wrestlers WHERE id = ($1)", [args.id])).rows
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
        wrestlerid: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        number: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        teamid: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
        name: { type: graphql.GraphQLString },
        eliminated: { type: graphql.GraphQLBoolean },
        eliminates: { type: new graphql.GraphQLList(graphql.GraphQLInt) },
        eliminatedby: { type: new graphql.GraphQLList(graphql.GraphQLInt) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (await client.query("INSERT INTO wrestler(wrestlerid, number, teamid, name, eliminated, eliminates, eliminatedBy) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [args.wrestlerid, args.number, args.teamid, args.name, args.eliminated, args.eliminates, args.eliminatedby])).rows[0]
        } catch (err) {
          throw new Error("Failed to create wrestlers")
        }
      }
    },
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


