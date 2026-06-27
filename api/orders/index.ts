import { z } from 'zod';
import { prisma, requireAuth, ok, err, setCors } from '../_helpers.js';

const createSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      customNotes: z.string().optional(),
    })
  ).min(1, 'Order must have at least one item'),
  shippingAddress: z.object({
    line1: z.string(),
    city: z.string(),
    state: z.string().optional(),
    country: z.string(),
    postalCode: z.string().optional(),
  }).optional(),
  notes: z.string().optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  if (req.method === 'GET') {
    const orders = await prisma.order.findMany({
      where: { userId: authUser.id },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, orders);
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);

    const { items, shippingAddress, notes } = parsed.data;

    // Fetch products to calculate total
    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });

    if (products.length !== productIds.length) {
      return err(res, 'One or more products not found');
    }

    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        customNotes: item.customNotes,
      };
    });

    const order = await prisma.order.create({
      data: {
        userId: authUser.id,
        totalAmount,
        shippingAddress: shippingAddress as any,
        notes,
        items: { create: orderItems },
      },
      include: {
        items: { include: { product: { select: { id: true, name: true, images: true } } } },
      },
    });

    return ok(res, order, 201);
  }

  return err(res, 'Method not allowed', 405);
}
