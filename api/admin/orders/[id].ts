import { z } from 'zod';
import { prisma, requireAdmin, ok, err, setCors, audit } from '../../_helpers.js';

const updateSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED']).optional(),
  internalNotes: z.string().optional(),
  assignedTo: z.string().optional(),
  statusNote: z.string().optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const id = String(req.params.id);

  if (req.method === 'GET') {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        items: {
          include: {
            product: { select: { id: true, name: true, category: true, images: true } },
          },
        },
        statusLogs: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!order) return err(res, 'Order not found', 404);
    return ok(res, order);
  }

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);

    const { status, internalNotes, assignedTo, statusNote } = parsed.data;

    try {
      const updateData: any = {};
      if (status !== undefined) updateData.status = status;
      if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

      const order = await prisma.order.update({
        where: { id },
        data: updateData,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { id: true, name: true } } } },
          statusLogs: { orderBy: { createdAt: 'asc' } },
        },
      });

      // Log status change
      if (status) {
        await prisma.orderStatusLog.create({
          data: { orderId: id, status, note: statusNote },
        });
        await audit(admin.id, 'UPDATE_ORDER_STATUS', 'Order', id, { status, statusNote });
      }

      return ok(res, order);
    } catch {
      return err(res, 'Order not found', 404);
    }
  }

  return err(res, 'Method not allowed', 405);
}
