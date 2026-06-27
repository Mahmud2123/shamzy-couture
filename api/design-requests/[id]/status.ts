import { z } from 'zod';
import { prisma, requireAdmin, ok, err, setCors } from '../../_helpers.js';

const schema = z.object({
  status: z.enum(['PENDING', 'REVIEWING', 'QUOTED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED']),
  adminNotes: z.string().optional(),
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
    const request = await prisma.designRequest.update({
      where: { id },
      data: parsed.data,
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: {
          include: { user: { select: { id: true, name: true, role: true } } },
        },
      },
    });
    return ok(res, request);
  } catch {
    return err(res, 'Design request not found', 404);
  }
}
