import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    const [messages, total] = await Promise.all([
      prisma.contactMessage.findMany({
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactMessage.count(),
    ]);

    const unreadCount = await prisma.contactMessage.count({
      where: { isRead: false },
    });

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
      unreadCount,
    });
  } catch (error) {
    console.error("Contact messages GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contact messages" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
