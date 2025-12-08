export interface PaginatePrismaOptions {
  // We use `any` for the Prisma model delegate to simplify typing
  model: any;
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
}: PaginatePrismaOptions): Promise<{ data: T[]; totalCount: number }> {
  const skip = (page - 1) * perPage;
  const [totalCount, data] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    model.count({ where }) as Promise<number>,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    model.findMany({ where, include, orderBy, take: perPage, skip }) as Promise<T[]>,
  ]);
  return { data, totalCount };
}
