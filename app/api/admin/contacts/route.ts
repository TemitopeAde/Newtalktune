import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || "";
    const plan = searchParams.get("plan") || "";
    const role = searchParams.get("role") || "";

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (plan === "__paid__") {
      where.AND = [
        { subscriptionPlan: { not: null } },
        { subscriptionPlan: { not: "free" } },
      ];
    } else if (plan) {
      where.subscriptionPlan = plan;
    }

    if (role) {
      where.role = role;
    }

    const [users, total, planCounts] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          subscriptionPlan: true,
          subscriptionCycle: true,
          subscriptionStartDate: true,
          subscriptionEndDate: true,
          isVerified: true,
          createdAt: true,
          image: true,
          _count: {
            select: { scripts: true },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.groupBy({
        by: ["subscriptionPlan"],
        where,
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      users,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: skip + limit < total,
        hasPrevPage: page > 1,
      },
      planCounts,
    });
  } catch (error) {
    console.error("Admin contacts GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch contacts" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
