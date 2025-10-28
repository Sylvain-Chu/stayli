export interface PaginatePrismaOptions<T extends object> {
  model: {
    count: (args: { where?: object }) => Promise<number>;
    findMany: (args: {
      where?: object;
      include?: object;
      orderBy?: object;
      take?: number;
      skip?: number;
    }) => Promise<T[]>;
  };
  where?: object;
  include?: object;
  orderBy?: object;
  page?: number;
  perPage?: number;
}

export async function paginatePrisma<T extends object>({
  model,
  where = {},
  include,
  orderBy,
  page = 1,
  perPage = 6,
}: PaginatePrismaOptions<T>): Promise<{ data: T[]; totalCount: number }> {
  const skip = (page - 1) * perPage;
  const [totalCount, data] = await Promise.all([
    model.count({ where }),
    model.findMany({ where, include, orderBy, take: perPage, skip }),
  ]);
  return { data, totalCount };
}
