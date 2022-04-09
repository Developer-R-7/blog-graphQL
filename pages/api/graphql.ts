import { gql, ApolloServer } from 'apollo-server-micro';
import Cors from 'micro-cors';
import { PageConfig } from 'next';
import { getDbClient } from '../../helper/database';

const typeDefs = gql`
  type Query {
    blogList(first: Int = 25, skip: Int = 0): [blogs!]!
  }

  type blogs {
    id: Int
    title: String
    author: Author
  }

  type Author {
    name: String!
    total_blogs: Int
  }
`;
const cors = Cors();
const resolvers = {
  Query: {
    blogList: async (_parent: any, _args: any, _context: any) => {
      const db = (await getDbClient())!.db().collection('blogs');
      const data = await db.find().toArray();
      return data;
    },
  },
};

const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
});
export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

const startServer = apolloServer.start();

export default cors(async (req: any, res: any) => {
  if (req.method === 'OPTIONS') {
    res.end();
    return false;
  }

  await startServer;
  await apolloServer.createHandler({ path: '/api/graphql' })(req, res);
});
