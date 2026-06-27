import { z } from 'zod';
import { prisma, requireAdmin, ok, err, setCors } from '../_helpers.js';

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  category: z.enum(['SUITS', 'SHIRTS', 'TROUSERS', 'JACKETS', 'ACCESSORIES', 'CUSTOM']),
  stock: z.number().int().min(0).default(0),
  images: z.array(z.string()).optional().default([]),
  status: z.enum(['ACTIVE', 'INACTIVE', 'DRAFT']).default('ACTIVE'),
  variations: z.any().optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const { category, status = 'ACTIVE', search } = req.query;
    const where: any = {};
    if (category) where.category = String(category);
    if (status) where.status = String(status);
    if (search) where.name = { contains: String(search), mode: 'insensitive' };

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, products);
  }

  if (req.method === 'POST') {
    const admin = await requireAdmin(req, res);
    if (!admin) return;
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);
    const product = await prisma.product.create({ data: parsed.data });
    return ok(res, product, 201);
  }

  return err(res, 'Method not allowed', 405);
}
