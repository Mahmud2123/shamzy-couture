import { prisma, requireAdmin, ok, err, setCors } from '../../_helpers.js';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { userId, productType, page = '1', limit = '20' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = { isDeleted: false };
  if (userId) where.userId = String(userId);
  if (productType) where.productType = String(productType);

  const [measurements, total] = await Promise.all([
    prisma.measurement.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.measurement.count({ where }),
  ]);

  return ok(res, { measurements, total, page: Number(page), limit: Number(limit) });
}
