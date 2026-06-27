import { z } from 'zod';
import { prisma, requireAdmin, ok, err, setCors } from '../../_helpers.js';

const schema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED']),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return err(res, 'Method not allowed', 405);

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const id = String(req.params.id);

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return err(res, parsed.error.errors[0].message);

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { status: parsed.data.status },
      include: {
        items: { include: { product: { select: { id: true, name: true } } } },
        user: { select: { id: true, name: true, email: true } },
      },
    });
    return ok(res, order);
  } catch {
    return err(res, 'Order not found', 404);
  }
}
