const DEFAULT_PAGE = 1;
const BATCH_SIZE = 25;

const getPaginationMode = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || DEFAULT_PAGE, 1);
  const cursor = typeof query.cursor === "string" && query.cursor.trim() ? query.cursor.trim() : null;
  const mode = query.page !== undefined ? "page" : "cursor";

  return { mode, page, cursor, limit: BATCH_SIZE };
};

const applyPopulate = (mongooseQuery, populate) => {
  if (!populate) return mongooseQuery;

  if (Array.isArray(populate)) {
    populate.forEach((p) => {
      mongooseQuery.populate(p);
    });
    return mongooseQuery;
  }

  return mongooseQuery.populate(populate);
};

const paginateModel = async ({
  model,
  query = {},
  filter = {},
  sort = { createdAt: -1 },
  cursorField = "createdAt",
  select,
  populate,
}) => {
  const { mode, page, cursor, limit } = getPaginationMode(query);
  const finalFilter = { ...filter };

  if (mode === "cursor") {
    const cursorDate = new Date(cursor);
    if (!Number.isNaN(cursorDate.getTime())) {
      finalFilter[cursorField] = { $lt: cursorDate };
    }
  }

  const normalizedSort = sort.createdAt ? sort : { createdAt: -1, ...sort };
  let mongooseQuery = model.find(finalFilter).sort(normalizedSort).limit(limit + 1);

  if (mode === "page") {
    const skip = (page - 1) * limit;
    mongooseQuery = mongooseQuery.skip(skip);
  }

  if (select) {
    mongooseQuery = mongooseQuery.select(select);
  }

  mongooseQuery = applyPopulate(mongooseQuery, populate);

  const rows = await mongooseQuery;
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  const nextCursorValue = hasMore && data.length > 0 ? data[data.length - 1][cursorField] : null;
  const nextCursor = nextCursorValue ? new Date(nextCursorValue).toISOString() : null;

  if (mode === "cursor") {
    return { data, nextCursor, hasMore };
  }

  return {
    data,
    nextCursor,
    nextPage: hasMore ? page + 1 : null,
    hasMore,
  };
};

module.exports = {
  BATCH_SIZE,
  getPaginationMode,
  paginateModel,
};
