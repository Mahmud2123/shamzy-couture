import { z } from 'zod';
import { prisma, requireAuth, ok, err, setCors } from '../_helpers.js';

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  budget: z.number().positive().optional(),
  deadline: z.string().datetime().optional(),
  attachments: z.array(z.string()).optional().default([]),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  if (req.method === 'GET') {
    const requests = await prisma.designRequest.findMany({
      where: { userId: authUser.id },
      include: {
        messages: {
          include: { user: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return ok(res, requests);
  }

  if (req.method === 'POST') {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) return err(res, parsed.error.errors[0].message);

    const { deadline, ...rest } = parsed.data;
    const request = await prisma.designRequest.create({
      data: {
        ...rest,
        deadline: deadline ? new Date(deadline) : undefined,
        userId: authUser.id,
      },
    });
    return ok(res, request, 201);
  }

  return err(res, 'Method not allowed', 405);
}
