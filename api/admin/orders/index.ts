import { prisma, requireAdmin, ok, err, setCors } from '../../_helpers.js';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { search, status, page = '1', limit = '20' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (status) where.status = String(status);
  if (search) {
    where.OR = [
      { id: { contains: String(search), mode: 'insensitive' } },
      { user: { name: { contains: String(search), mode: 'insensitive' } } },
      { user: { email: { contains: String(search), mode: 'insensitive' } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { id: true, name: true } } } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return ok(res, { orders, total, page: Number(page), limit: Number(limit) });
}
