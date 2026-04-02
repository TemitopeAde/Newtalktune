import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StatusCodes } from "http-status-codes";
import { sendAdminReplyEmail } from "@/utils/emails";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reply } = await request.json();

    if (!reply || typeof reply !== "string" || !reply.trim()) {
      return NextResponse.json(
        { error: "Reply message is required" },
        { status: StatusCodes.BAD_REQUEST }
      );
    }

    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!contactMessage) {
      return NextResponse.json(
        { error: "Message not found" },
        { status: StatusCodes.NOT_FOUND }
      );
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        adminReply: reply.trim(),
        repliedAt: new Date(),
        isRead: true,
      },
    });

    await sendAdminReplyEmail(
      contactMessage.email,
      contactMessage.name,
      contactMessage.message,
      reply.trim()
    );

    return NextResponse.json({
      success: true,
      message: "Reply sent successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Contact message reply error:", error);
    return NextResponse.json(
      { error: "Failed to send reply" },
      { status: StatusCodes.INTERNAL_SERVER_ERROR }
    );
  }
}
