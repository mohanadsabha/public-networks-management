import { getDb } from "../../config/db";
import { routers } from "../../db/schema/routers";
import { subscribers } from "../../db/schema/subscribers";
import { eq, or, ilike } from "drizzle-orm";
import AppError from "../../utils/appError";
import { CreateRouterInput, UpdateRouterInput, AssignRouterInput } from "./routers.validation";
import cloudinary from "../../config/cloudinary";
import { normalizeRouterPortForDb } from "../../utils/routerPort.util";

export async function getAllRouters(page: number = 1, limit: number = 50, search?: string) {
  const db = getDb();
  const offset = (page - 1) * limit;
  const data = await db.select().from(routers).limit(limit).offset(offset);

  return {
    data,
    total: data.length,
    page,
    limit,
    pages: Math.ceil(data.length / limit),
  };
}

export async function getRouterById(id: number) {
  const db = getDb();
  const [router] = await db.select().from(routers).where(eq(routers.id, id));
  return router;
}

export async function createRouter(input: CreateRouterInput, imageUrl?: string, publicId?: string) {
  const db = getDb();
  const [router] = await db
    .insert(routers)
    .values({
      ...input,
      routerImage: imageUrl,
      routerPublicId: publicId,
    })
    .returning();
  return router;
}

export async function updateRouter(id: number, input: UpdateRouterInput, imageUrl?: string, publicId?: string) {
  const db = getDb();
  const router = await getRouterById(id);
  if (!router) throw new AppError("Router not found", 404);

  if (imageUrl !== undefined && router.routerPublicId) await cloudinary.uploader.destroy(router.routerPublicId);

  const [updated] = await db
    .update(routers)
    .set({
      ...input,
      ...(imageUrl && { routerImage: imageUrl }),
      ...(publicId && { routerPublicId: publicId }),
    })
    .where(eq(routers.id, id))
    .returning();
  return updated;
}

export async function deleteRouter(id: number) {
  const db = getDb();
  const router = await getRouterById(id);
  if (!router) throw new AppError("Router not found", 404);

  await db.delete(routers).where(eq(routers.id, id));
}

export async function deleteRoutersBulk(ids: number[]) {
  const db = getDb();
  if (ids.length === 0) throw new AppError("No router IDs provided", 400);

  const result = await db.delete(routers).where(or(...ids.map((id) => eq(routers.id, id))));

  return ids.length;
}

export async function deleteAllRouters() {
  const db = getDb();
  await db.delete(routers);
}

export async function assignRouterToSubscriber(routerId: number, input: AssignRouterInput) {
  const db = getDb();

  // Verify router exists
  const router = await getRouterById(routerId);
  if (!router) throw new AppError("Router not found", 404);

  // Verify subscriber exists
  const [subscriber] = await db.select().from(subscribers).where(eq(subscribers.id, input.subscriberId));
  if (!subscriber) throw new AppError("Subscriber not found", 404);

  // Update subscriber with router assignment
  const [updated] = await db
    .update(subscribers)
    .set({
      routerId: routerId,
      routerPort: normalizeRouterPortForDb(input.routerPort),
    })
    .where(eq(subscribers.id, input.subscriberId))
    .returning();

  return updated;
}
