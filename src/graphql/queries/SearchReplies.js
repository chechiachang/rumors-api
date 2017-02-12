import {
  GraphQLString,
} from 'graphql';

import {
  getSortableType,
  getSortArgs,
  getPagedType,
  getSearchAfterFromCursor,
  pagingArgs,
} from 'graphql/util';

import Reply from 'graphql/models/Reply';

export default {
  args: {
    text: { type: GraphQLString },
    orderBy: {
      type: getSortableType('SearchReplyOrderBy', [
        '_score',
      ]),
    },
    ...pagingArgs,
  },

  async resolve(rootValue, { text, orderBy = [], first, after }) {
    const body = {
      query: {
        more_like_this: {
          fields: ['versions.text'],
          like: text,
          min_term_freq: 1,
          min_doc_freq: 1,
          minimum_should_match: '10<70%',
        },
      },
    };

    if (after) {
      body.search_after = getSearchAfterFromCursor(after);
    }

    // should return search context for resolveEdges & resolvePageInfo
    return {
      index: 'replies',
      type: 'basic',
      body,
      sort: getSortArgs(orderBy),
      size: first,
      trackScores: true,
    };
  },

  type: getPagedType('SearchReplyResult', Reply),
};
