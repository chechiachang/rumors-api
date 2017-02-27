import {
  GraphQLObjectType,
  GraphQLSchema,
} from 'graphql';

// Full-text search
import Search from './queries/Search';

// Get individual objects
import GetArticle from './queries/GetArticle';
import GetReply from './queries/GetReply';
import GetUser from './queries/GetUser';
import ListArticles from './queries/ListArticles';
import SearchArticles from './queries/SearchArticles';
import SearchReplies from './queries/SearchReplies';
import SearchCrawledDocs from './queries/SearchCrawledDocs';

// Set individual objects
import SetArticle from './mutations/SetArticle';
import SetReply from './mutations/SetReply';

export default new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      Search,
      GetArticle,
      GetReply,
      GetUser,
      ListArticles,
      SearchArticles,
      SearchReplies,
      SearchCrawledDocs,
    },
  }),
  mutation: new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      SetArticle,
      SetReply,
    },
  }),
});
