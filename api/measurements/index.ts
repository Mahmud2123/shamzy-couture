import { z } from 'zod';
import { prisma, requireAuth, ok, err, setCors } from '../_helpers.js';

const createSchema = z.object({
  name: z.string().min(1).default('My Measurements'),
  productType: z.enum(['SUIT', 'SHIRT', 'TROUSER', 'JACKET', 'CUSTOM']),
  unit: z.enum(['CM', 'INCHES']).default('CM'),
  measurements: z.record(z.string(), z.number().nullable()),
  isDefault: z.boolean().default(false),
  measuredDate: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  if (req.method === 'GET') {
    const { productType } = req.query;
    const where: any = { userId: authUser.id, isDeleted: false };
    if (productType) where.productType = String(productType);

    const measurements = await prisma.measurement.findMany({
      where,
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return ok(res, measurements);
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);

    const { isDefault, productType, ...rest } = parsed.data;

    // If setting as default, unset others of same type
    if (isDefault) {
      await prisma.measurement.updateMany({
        where: { userId: authUser.id, productType, isDefault: true },
        data: { isDefault: false },
      });
    }

    const measurement = await prisma.measurement.create({
      data: {
        ...rest,
        productType,
        isDefault,
        userId: authUser.id,
        measuredDate: rest.measuredDate ? new Date(rest.measuredDate) : undefined,
      },
    });
    return ok(res, measurement, 201);
  }

  return err(res, 'Method not allowed', 405);
}
