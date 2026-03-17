import { db } from "@/db";
import {
  clientServiceOccurrences,
  clientServices,
  occurrenceFieldLinks,
} from "@/db/schema/services";
import { pusherServer } from "@/lib/pusher";
import { and, eq, gt, isNull } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Pusher private channel auth endpoint for terrain (token-based, no user session).
 *
 * The terrain Pusher client sends:
 *   socket_id    (in form body)
 *   channel_name (in form body, e.g. "private-terrain-<occurrenceId>")
 *   x-terrain-token (header injected by the terrain Pusher client config)
 *
 * This endpoint validates the token against the DB and authorizes the channel.
 */
export async function POST(request: NextRequest) {
  const body = await request.formData();
  const socketId = body.get("socket_id") as string | null;
  const channelName = body.get("channel_name") as string | null;
  const token = request.headers.get("x-terrain-token");

  if (!socketId || !channelName || !token) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const CHANNEL_PREFIX = "private-terrain-";
  if (!channelName.startsWith(CHANNEL_PREFIX)) {
    return NextResponse.json({ error: "Invalid channel" }, { status: 403 });
  }

  const occurrenceId = channelName.slice(CHANNEL_PREFIX.length);
  const now = new Date();

  // Validate that the token is active AND belongs to this occurrence
  const [row] = await db
    .select({ id: occurrenceFieldLinks.id })
    .from(occurrenceFieldLinks)
    .innerJoin(
      clientServiceOccurrences,
      eq(clientServiceOccurrences.id, occurrenceFieldLinks.occurrenceId),
    )
    .innerJoin(
      clientServices,
      eq(clientServices.id, clientServiceOccurrences.clientServiceId),
    )
    .where(
      and(
        eq(occurrenceFieldLinks.token, token),
        eq(occurrenceFieldLinks.occurrenceId, occurrenceId),
        isNull(occurrenceFieldLinks.revokedAt),
        gt(occurrenceFieldLinks.expiresAt, now),
      ),
    )
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const auth = pusherServer.authorizeChannel(socketId, channelName);
  return NextResponse.json(auth);
}
