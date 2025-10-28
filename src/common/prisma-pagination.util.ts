export interface PaginatePrismaOptions<T extends object> {
  model: any; // Accept any Prisma delegate (for compatibility)
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
    model.findMany({ where, include, orderBy, take: perPage, skip }) as Promise<T[]>,
  ]);
  return { data, totalCount };
}
