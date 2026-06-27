import { prisma, requireAdmin, ok, err, setCors } from '../_helpers.js';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const requests = await prisma.designRequest.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      messages: {
        include: { user: { select: { id: true, name: true, role: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ok(res, requests);
}
