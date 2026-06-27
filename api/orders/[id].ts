import { prisma, requireAuth, ok, err, setCors } from '../_helpers.js';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return err(res, 'Method not allowed', 405);

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const id = String(req.params.id);

  const order = await prisma.order.findFirst({
    where: {
      id,
      ...(authUser.role !== 'ADMIN' ? { userId: authUser.id } : {}),
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, images: true, category: true } },
        },
      },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) return err(res, 'Order not found', 404);
  return ok(res, order);
}
