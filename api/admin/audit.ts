import { prisma, requireAdmin, ok, err, setCors } from '../../_helpers.js';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const { entity, page = '1', limit = '30' } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const where: any = {};
  if (entity) where.entity = String(entity);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, role: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return ok(res, { logs, total });
}
