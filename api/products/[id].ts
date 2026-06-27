import { z } from 'zod';
import { prisma, requireAdmin, ok, err, setCors, audit } from '../_helpers.js';

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  category: z.enum(['SUITS', 'SHIRTS', 'TROUSERS', 'JACKETS', 'ACCESSORIES', 'CUSTOM']).optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string()).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).optional(),
  variations: z.any().optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const id = String(req.params.id);

  if (req.method === 'GET') {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return err(res, 'Product not found', 404);
    return ok(res, product);
  }

  if (req.method === 'PUT') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    try {
      const product = await prisma.product.update({ where: { id }, data: parsed.data });
      await audit(admin.id, 'UPDATE_PRODUCT', 'Product', id, parsed.data);
      return ok(res, product);
    } catch { return err(res, 'Product not found', 404); }
  }

  if (req.method === 'DELETE') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    try {
      await prisma.product.delete({ where: { id } });
      await audit(admin.id, 'DELETE_PRODUCT', 'Product', id);
      return ok(res, { deleted: true });
    } catch { return err(res, 'Product not found', 404); }
  }

  return err(res, 'Method not allowed', 405);
}
