import { prisma, requireAdmin, ok, err, setCors } from '../_helpers.js';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const [
    totalUsers,
    totalOrders,
    totalProducts,
    totalDesignRequests,
    revenueResult,
    recentOrders,
    ordersByStatus,
    recentUsers,
    recentAuditLogs,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER', isActive: true } }),
    prisma.order.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.designRequest.count(),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: { not: 'CANCELLED' } },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: { _all: true },
    }),
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { role: 'CUSTOMER' },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true, role: true } } },
    }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const s of ordersByStatus) {
    statusMap[s.status] = s._count._all;
  }

  return ok(res, {
    overview: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalDesignRequests,
      totalRevenue: revenueResult._sum.totalAmount || 0,
    },
    ordersByStatus: statusMap,
    recentOrders,
    recentUsers,
    recentAuditLogs,
  });
}
