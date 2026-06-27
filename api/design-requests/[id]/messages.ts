import { z } from 'zod';
import { prisma, requireAuth, ok, err, setCors } from '../../_helpers.js';

const schema = z.object({
  content: z.string().min(1, 'Message content is required'),
});

export default async function handler(req: any, res: any) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return err(res, 'Method not allowed', 405);

  const authUser = requireAuth(req, res);
  if (!authUser) return;

  const id = String(req.params.id);

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return err(res, parsed.error.errors[0].message);

  // Verify the design request exists and user has access
  const designRequest = await prisma.designRequest.findFirst({
    where: {
      id,
      ...(authUser.role !== 'ADMIN' ? { userId: authUser.id } : {}),
    },
  });

  if (!designRequest) return err(res, 'Design request not found', 404);

  const message = await prisma.designMessage.create({
    data: {
      designRequestId: id,
      userId: authUser.id,
      content: parsed.data.content,
    },
    include: {
      user: { select: { id: true, name: true, role: true } },
    },
  });

  return ok(res, message, 201);
}
