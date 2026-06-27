import { z } from 'zod';
import { prisma, requireAuth, ok, err, setCors } from '../_helpers.js';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  unit: z.enum(['CM', 'INCHES']).optional(),
  measurements: z.record(z.string(), z.number().nullable()).optional(),
  isDefault: z.boolean().optional(),
  notes: z.string().optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const id = String(req.params.id);

  if (req.method === 'GET') {
    const m = await prisma.measurement.findFirst({
      where: { id, userId: authUser.id, isDeleted: false },
    });
    if (!m) return err(res, 'Measurement not found', 404);
    return ok(res, m);
  }

  if (req.method === 'PUT') {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);

    const existing = await prisma.measurement.findFirst({
      where: { id, userId: authUser.id, isDeleted: false },
    });
    if (!existing) return err(res, 'Measurement not found', 404);

    if (parsed.data.isDefault) {
      await prisma.measurement.updateMany({
        where: { userId: authUser.id, productType: existing.productType, isDefault: true },
        data: { isDefault: false },
      });
    }

    const m = await prisma.measurement.update({ where: { id }, data: parsed.data });
    return ok(res, m);
  }

  if (req.method === 'DELETE') {
    const existing = await prisma.measurement.findFirst({
      where: { id, userId: authUser.id },
    });
    if (!existing) return err(res, 'Measurement not found', 404);
    await prisma.measurement.update({ where: { id }, data: { isDeleted: true } });
    return ok(res, { deleted: true });
  }

  return err(res, 'Method not allowed', 405);
}
