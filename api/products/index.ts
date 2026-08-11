import { z } from 'zod';
import {
  prisma,
  requireAdmin,
  ok,
  err,
  setCors,
} from '../_helpers.js';

const productCategories = [
  'SUITS',
  'SHIRTS',
  'TROUSERS',
  'JACKETS',
  'ACCESSORIES',
  'CUSTOM',
  'ROBES',
  'ABAYAS',
  'FOOTWEAR',
] as const;

const productStatuses = [
  'ACTIVE',
  'INACTIVE',
  'DRAFT',
] as const;

const createSchema = z.object({
  name: z.string().min(1, 'Product name is required'),

  description: z.string().min(1, 'Product description is required'),

  price: z
    .number()
    .positive('Price must be greater than zero'),

  category: z.enum(productCategories),

  stock: z
    .number()
    .int()
    .min(0)
    .default(0),

  images: z
    .array(z.string())
    .default([]),

  status: z
    .enum(productStatuses)
    .default('ACTIVE'),

  variations: z
    .any()
    .optional(),
});

export default async function handler(req: any, res: any) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // ============================================================
  // GET PRODUCTS
  // ============================================================

  if (req.method === 'GET') {
    try {
      const {
        category,
        status = 'ACTIVE',
        search,
      } = req.query;

      const where: any = {};

      // --------------------------------------------------------
      // CATEGORY FILTER
      // --------------------------------------------------------

      if (category) {
        const categoryValue = String(category);

        if (
          !productCategories.includes(
            categoryValue as (typeof productCategories)[number]
          )
        ) {
          return err(
            res,
            `Invalid product category: ${categoryValue}`,
            400
          );
        }

        where.category = categoryValue;
      }

      // --------------------------------------------------------
      // STATUS FILTER
      // --------------------------------------------------------

      if (status) {
        const statusValue = String(status);

        if (
          !productStatuses.includes(
            statusValue as (typeof productStatuses)[number]
          )
        ) {
          return err(
            res,
            `Invalid product status: ${statusValue}`,
            400
          );
        }

        where.status = statusValue;
      }

      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      if (search) {
        where.name = {
          contains: String(search),
          mode: 'insensitive',
        };
      }

      // --------------------------------------------------------
      // DATABASE QUERY
      // --------------------------------------------------------

      const products = await prisma.product.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      return ok(res, products);
    } catch (error) {
      console.error('GET PRODUCTS ERROR:', error);

      return err(
        res,
        'Failed to fetch products',
        500
      );
    }
  }

  // ============================================================
  // CREATE PRODUCT
  // ============================================================

  if (req.method === 'POST') {
    try {
      const admin = await requireAdmin(req, res);

      if (!admin) {
        return;
      }

      const parsed = createSchema.safeParse(req.body);

      if (!parsed.success) {
        return err(
          res,
          parsed.error.errors[0].message,
          400
        );
      }

      const product = await prisma.product.create({
        data: parsed.data,
      });

      return ok(res, product, 201);
    } catch (error) {
      console.error('CREATE PRODUCT ERROR:', error);

      return err(
        res,
        'Failed to create product',
        500
      );
    }
  }

  // ============================================================
  // METHOD NOT ALLOWED
  // ============================================================

  return err(
    res,
    'Method not allowed',
    405
  );
}
