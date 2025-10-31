export interface PrismaDelegate<T> {
  count(args?: { where?: unknown }): Promise<number>;
  findMany(args: {
    where?: unknown;
    include?: unknown;
    orderBy?: unknown;
    take?: number;
    skip?: number;
  }): Promise<T[]>;
}

export interface PaginatePrismaOptions<T extends object> {
  model: PrismaDelegate<T>;
  where?: unknown;
  include?: unknown;
  orderBy?: unknown;
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
