'use server'

import { prisma } from "@/lib/prisma"
import { UploadScriptDataWithVoice } from "@/types";
import { uploadScriptSchema } from "@/utils/schema";
import { generateAudio } from "@/actions/generateAudio";
import { PLANS } from "@/constants/Plans";
import { z } from "zod"

// Characters allowed per single voiceover per plan
const PLAN_SCRIPT_LIMITS: Record<string, number> = {
  free: 150,
  creator: 1500,
  pro: 5000,
};

// Total characters allowed per billing period per plan
const PLAN_MONTHLY_LIMITS: Record<string, number | null> = {
  free: 300,
  creator: 174000,
  pro: null, // unlimited
};

export async function uploadScript(formData: UploadScriptDataWithVoice): Promise<{
  success?: boolean;
  error?: string;
  message?: string;
  scriptId?: string;
  limitReached?: boolean;
  data?: any;
}> {
  try {
    const {
      projectName,
      language,
      content,
      mode,
      fileName,
      fileSize,
      fileType,
      userId,
      voiceSettings,
      generateAudio: shouldGenerateAudio,
      voiceModelId,
    } = formData;

    const validation = uploadScriptSchema.safeParse(formData);
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        subscriptionPlan: true,
        subscriptionStartDate: true,
        charactersUsed: true,
      },
    });

    if (!user) {
      return { error: "User not found" };
    }

    const planId = user.subscriptionPlan ?? "free";
    const contentLength = content.trim().length;

    // Enforce per-voiceover script limit
    const scriptLimit = PLAN_SCRIPT_LIMITS[planId] ?? PLAN_SCRIPT_LIMITS.free;
    if (contentLength > scriptLimit) {
      return {
        error: `Your ${planId} plan allows up to ${scriptLimit.toLocaleString()} characters per voiceover. Your script has ${contentLength.toLocaleString()} characters. Please upgrade your plan or shorten your script.`,
        limitReached: true,
      };
    }

    // Enforce monthly character limit (only for plans with a cap)
    const monthlyLimit = PLAN_MONTHLY_LIMITS[planId];
    if (monthlyLimit !== null && shouldGenerateAudio) {
      // Reset charactersUsed if a new billing period has started
      let currentUsage = user.charactersUsed;
      if (user.subscriptionStartDate) {
        const now = new Date();
        const periodStart = new Date(user.subscriptionStartDate);
        const monthsElapsed =
          (now.getFullYear() - periodStart.getFullYear()) * 12 +
          (now.getMonth() - periodStart.getMonth());

        if (monthsElapsed > 0) {
          // New billing period — reset usage
          await prisma.user.update({
            where: { id: userId },
            data: {
              charactersUsed: 0,
              subscriptionStartDate: now,
            },
          });
          currentUsage = 0;
        }
      }

      if (currentUsage + contentLength > monthlyLimit) {
        const remaining = Math.max(0, monthlyLimit - currentUsage);
        return {
          error: `You've used ${currentUsage.toLocaleString()} of your ${monthlyLimit.toLocaleString()} monthly characters. Only ${remaining.toLocaleString()} characters remaining. Please upgrade your plan to continue.`,
          limitReached: true,
        };
      }
    }

    if (mode === "upload" && !fileName) {
      return { error: "File name is required for upload mode" };
    }

    const scriptId = `script_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const script = await prisma.script.create({
      data: {
        id: scriptId,
        projectName: projectName.trim(),
        language: language.toLowerCase(),
        content,
        fileName: fileName || null,
        fileSize: fileSize || null,
        fileType: fileType || null,
        uploadMode: mode,
        userId,
      },
    });

    // Generate audio if requested and voice settings are provided
    let audioData = null;
    if (shouldGenerateAudio && content.trim() && voiceSettings) {
      try {
        const audioResult = await generateAudio(content, voiceSettings, scriptId, voiceModelId);

        if (audioResult.success) {
          await prisma.script.update({
            where: { id: scriptId },
            data: {
              audioFileName: audioResult.audioFileName,
              audioFileSize: audioResult.audioFileSize,
              audioFileUrl: audioResult.audioFileUrl,
              audioGenerated: true,
              audioSettings: JSON.stringify(voiceSettings),
            },
          });

          // Increment charactersUsed only on successful audio generation
          await prisma.user.update({
            where: { id: userId },
            data: { charactersUsed: { increment: contentLength } },
          });

          audioData = {
            audioFileName: audioResult.audioFileName,
            audioFileSize: audioResult.audioFileSize,
            audioFileUrl: audioResult.audioFileUrl,
          };
        } else {
          console.warn("Audio generation failed:", audioResult.error);
        }
      } catch (audioError) {
        console.error("Audio generation error:", audioError);
      }
    }

    return {
      success: true,
      message:
        shouldGenerateAudio && audioData
          ? "Script uploaded and audio generated successfully"
          : "Script uploaded successfully",
      scriptId: script.id,
      data: {
        id: script.id,
        projectName: script.projectName,
        language: script.language,
        content: script.content,
        fileName: script.fileName,
        fileSize: script.fileSize,
        fileType: script.fileType,
        uploadMode: script.uploadMode,
        createdAt: script.createdAt,
        ...audioData,
      },
    };
  } catch (error) {
    console.error("Upload script error:", error);

    if (error instanceof z.ZodError) {
      return { error: error.issues[0].message };
    }

    if (error && typeof error === "object" && "code" in error) {
      const prismaError = error as any;
      switch (prismaError.code) {
        case "P2002":
          return { error: "Script with this ID already exists" };
        case "P2025":
          return { error: "Record not found" };
        default:
          return {
            error: `Database error: ${prismaError.message || "Unknown database error"}`,
          };
      }
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === "string"
        ? error
        : "An unexpected error occurred during script upload";

    return { error: errorMessage };
  }
}
