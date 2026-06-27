import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma, requireAdmin, ok, err, setCors, audit } from '../../_helpers.js';

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  role: z.enum(['CUSTOMER', 'ADMIN']).optional(),
  isActive: z.boolean().optional(),
  newPassword: z.string().min(6).optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const admin = await requireAdmin(req, res);
  if (!admin) return;

  const id = String(req.params.id);

  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, phone: true,
        role: true, isActive: true, createdAt: true, updatedAt: true,
        orders: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          select: { id: true, status: true, totalAmount: true, createdAt: true },
        },
        measurements: {
          where: { isDeleted: false },
          select: { id: true, name: true, productType: true, createdAt: true },
        },
        _count: { select: { orders: true, measurements: true, designRequests: true } },
      },
    });
    if (!user) return err(res, 'User not found', 404);
    return ok(res, user);
  }

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);

    const { newPassword, ...rest } = parsed.data;
    const updateData: any = { ...rest };

    if (newPassword) {
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    try {
      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, email: true, phone: true, role: true, isActive: true },
      });
      await audit(admin.id, 'UPDATE_USER', 'User', id, rest);
      return ok(res, user);
    } catch {
      return err(res, 'User not found', 404);
    }
  }

  if (req.method === 'DELETE') {
    // Soft-delete: deactivate
    try {
      await prisma.user.update({ where: { id }, data: { isActive: false } });
      await audit(admin.id, 'DEACTIVATE_USER', 'User', id);
      return ok(res, { deactivated: true });
    } catch {
      return err(res, 'User not found', 404);
    }
  }

  return err(res, 'Method not allowed', 405);
}
