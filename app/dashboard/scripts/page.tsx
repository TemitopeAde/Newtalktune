"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import UploadScript from "@/components/UploadScript";
import { useStore } from "@/hooks/useStore";
import Project from "@/components/Project";
import { Script } from "@/types";
import { useScripts } from "@/hooks/scripts/useScript";
import AudioPlayerRow from "@/components/AudioPlayerRow";
import { useSession } from "next-auth/react";

interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface SubscriptionData {
  plan: {
    id: string;
    name: string;
    monthlyPrice: number;
  };
  usage: {
    charactersUsed: number;
    monthlyLimit: number | null;
    isUnlimited: boolean;
  };
}

const Page = () => {
  const { onOpen } = useStore();
  const { data: session, status } = useSession();
  const [currentPage, setCurrentPage] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);

  const SCRIPTS_PER_PAGE = 20;
  const { data, isLoading, error, refetch } = useScripts({
    page: currentPage,
    limit: SCRIPTS_PER_PAGE,
  });

  const scripts = data?.data?.scripts || [];
  const pagination = data?.data?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalScripts: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  // Fetch user profile and subscription on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const [profileRes, subscriptionRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/user/subscription"),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success && profileData.user) {
            setUserProfile({
              id: profileData.user.id,
              name: profileData.user.name,
              email: profileData.user.email,
            });
          }
        }

        if (subscriptionRes.ok) {
          const subscriptionData = await subscriptionRes.json();
          setSubscription(subscriptionData);
        }
      } catch (err) {
        console.error("Failed to load user data:", err);
      }
    };

    if (status !== "loading") {
      fetchUserData();
    }
  }, [status]);

  const handleAddVoice = () => {
    if (!userProfile) {
      return;
    }
    onOpen(
      "modal",
      <UploadScript
        userId={userProfile.id}
        subscription={subscription}
      />
    );
  };

  const openProject = (script: Script) => {
    onOpen("modal", <Project script={script} />);
  };

  const handlePrevPage = () => {
    if (pagination.hasPrevPage) setCurrentPage((prev) => prev - 1);
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) setCurrentPage((prev) => prev + 1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  const getPaginationText = () => {
    const start = (pagination.currentPage - 1) * SCRIPTS_PER_PAGE + 1;
    const end = Math.min(
      pagination.currentPage * SCRIPTS_PER_PAGE,
      pagination.totalScripts
    );
    return `${start}-${end} of ${pagination.totalScripts}`;
  };

  return (
    <div className="p-6 overflow-y-auto min-h-[90vh] md:min-h-screen">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">My Scripts</h2>

        <div className="flex items-center justify-between mb-6 w-full">
          <div className="flex items-center space-x-4 my-6 w-full">
            <button className="px-5 md:px-10 py-3 text-sm md:text-base whitespace-nowrap border border-[#6b952a] text-white rounded-sm hover:bg-green-500/10 transition-colors">
              {isLoading ? (
                <span className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </span>
              ) : (
                `Total Script: ${pagination.totalScripts}`
              )}
            </button>
            <button
              onClick={handleAddVoice}
              disabled={!userProfile}
              className="px-5 md:px-10 py-3 bg-white text-slate-900 rounded-sm hover:bg-gray-100 transition-colors md:text-base whitespace-nowrap font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Voice Over
            </button>
          </div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-white mb-6">Recent Projects</h3>

      {isLoading ? (
        <div className="rounded-lg border border-[#6b952a] py-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-slate-400 text-sm font-medium">
                  <th className="text-left px-6 pb-4">Voiceover Name</th>
                  <th className="text-left px-6 pb-4">Recordings</th>
                  <th className="text-right px-6 pb-4">Date</th>
                </tr>
              </thead>
              <tbody className="space-y-4">
                {Array.from({ length: SCRIPTS_PER_PAGE }, (_, i) => i + 1).map(
                  (index) => (
                    <tr
                      key={index}
                      className="border-b border-slate-500/50 last:border-b-0 animate-pulse"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-600 rounded-full" />
                          <div className="h-5 w-32 bg-slate-600 rounded" />
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-600 rounded-full" />
                          <div className="h-2 w-[200px] bg-slate-600 rounded-full" />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">
                        <div className="h-5 w-24 bg-slate-600 rounded ml-auto" />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-500 p-6 text-center">
          <p className="text-red-500">
            {error instanceof Error ? error.message : "An error occurred"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-6 py-2 bg-white text-slate-900 rounded-sm hover:bg-gray-100"
          >
            Retry
          </button>
        </div>
      ) : scripts.length === 0 ? (
        <div className="rounded-lg border border-[#6b952a] p-12 text-center">
          <p className="text-gray-400 text-lg">No scripts found</p>
          <p className="text-gray-500 text-sm mt-2">
            Click "Add Voice Over" to create your first script
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-[#6b952a] py-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-slate-400 text-sm font-medium">
                    <th className="text-left px-6 pb-4">Voiceover Name</th>
                    <th className="text-left px-6 pb-4">Recordings</th>
                    <th className="text-right px-6 pb-4">Date</th>
                  </tr>
                </thead>
                <tbody className="space-y-4">
                  {scripts.map((script) => (
                    <tr
                      key={script.id}
                      className="border-b border-slate-500/50 last:border-b-0"
                    >
                      <td className="px-6 py-3">
                        <div
                          onClick={() => openProject(script)}
                          className="flex cursor-pointer items-center space-x-3"
                        >
                          <div className="w-10 h-10 bg-slate-600 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-medium">
                              {getInitials(script.projectName)}
                            </div>
                          </div>
                          <span className="text-white font-medium whitespace-nowrap">
                            {script.projectName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        {script.audioGenerated && script.audioFileUrl ? (
                          <AudioPlayerRow
                            audioUrl={script.audioFileUrl}
                            audioFileName={script.audioFileName || undefined}
                          />
                        ) : (
                          <span className="text-slate-400 text-sm">
                            No audio
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap text-slate-400 text-sm text-right">
                        {formatDate(script.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center font-semibold justify-center space-x-4 mt-6 pt-4 border-t border-slate-700/50">
            <span className="text-slate-100 text-sm">{getPaginationText()}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevPage}
                disabled={!pagination.hasPrevPage}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6 text-slate-100" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={!pagination.hasNextPage}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6 text-slate-100" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
