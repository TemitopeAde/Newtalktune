"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Mail, MailOpen, MessageSquareReply, X, ChevronLeft, ChevronRight, Bold, Italic, List, ListOrdered } from "lucide-react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  isRead: boolean;
  adminReply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalMessages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function ContactMessagesAdmin() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [isSending, setIsSending] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Type your reply..." }),
    ],
    editorProps: {
      attributes: {
        class: "min-h-[140px] p-3 text-sm text-white focus:outline-none",
      },
    },
  });

  const fetchMessages = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/contact-messages?page=${page}&limit=20`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch messages");
      setMessages(data.messages);
      setPagination(data.pagination);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages(currentPage);
  }, [currentPage, fetchMessages]);

  const handleSelectMessage = (msg: ContactMessage) => {
    setSelectedMessage(msg);
    editor?.commands.clearContent();
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !editor) return;
    const html = editor.getHTML();
    const isEmpty = editor.isEmpty;
    if (isEmpty) return;
    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/contact-messages/${selectedMessage.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: html }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send reply");

      toast.success("Reply sent successfully");
      setSelectedMessage(data.data);
      editor.commands.clearContent();
      fetchMessages(currentPage);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send reply");
    } finally {
      setIsSending(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (msg: ContactMessage) => {
    if (msg.adminReply) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
          <MessageSquareReply className="w-3 h-3" /> Replied
        </span>
      );
    }
    if (msg.isRead) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-500/20 text-slate-400">
          <MailOpen className="w-3 h-3" /> Read
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
        <Mail className="w-3 h-3" /> Unread
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6 text-white">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Contact Messages</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full text-sm font-semibold bg-blue-500 text-white">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Messages List */}
          <div className={`flex flex-col gap-3 ${selectedMessage ? "w-1/2" : "w-full"}`}>
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-white" />
              </div>
            ) : messages.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="py-12 text-center">
                  <Mail className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                  <p className="text-slate-400">No contact messages yet</p>
                </CardContent>
              </Card>
            ) : (
              messages.map((msg) => (
                <Card
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`bg-slate-800 border-slate-700 cursor-pointer transition-all hover:border-slate-500 ${
                    selectedMessage?.id === msg.id ? "border-[#6b952a]" : ""
                  } ${!msg.isRead ? "border-l-4 border-l-blue-400" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">{msg.name}</p>
                        <p className="text-sm text-slate-400 truncate">{msg.email}</p>
                        <p className="text-sm text-slate-300 mt-1 line-clamp-2">{msg.message}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        {getStatusBadge(msg)}
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-slate-400">
                  {pagination.currentPage} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Detail / Reply Panel */}
          {selectedMessage && (
            <div className="w-1/2 flex flex-col gap-4">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div>
                    <CardTitle className="text-white text-lg">{selectedMessage.name}</CardTitle>
                    <p className="text-sm text-slate-400">{selectedMessage.email}</p>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>

                  {selectedMessage.adminReply ? (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1">
                        <MessageSquareReply className="w-3 h-3" />
                        Your reply · {selectedMessage.repliedAt ? formatDate(selectedMessage.repliedAt) : ""}
                      </p>
                      <div className="bg-[#6b952a]/10 border border-[#6b952a]/30 rounded-lg p-4">
                        <p className="text-sm text-slate-200 whitespace-pre-wrap">{selectedMessage.adminReply}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-slate-400 mb-2">Reply to {selectedMessage.name}</p>
                      <div className="bg-slate-900 border border-slate-600 rounded-lg overflow-hidden focus-within:border-[#6b952a]">
                        {/* Toolbar */}
                        <div className="flex items-center gap-1 px-2 py-1.5 border-b border-slate-700">
                          <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBold().run()}
                            className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${editor?.isActive("bold") ? "bg-slate-700 text-white" : "text-slate-400"}`}
                          >
                            <Bold className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleItalic().run()}
                            className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${editor?.isActive("italic") ? "bg-slate-700 text-white" : "text-slate-400"}`}
                          >
                            <Italic className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-px h-4 bg-slate-700 mx-1" />
                          <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleBulletList().run()}
                            className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${editor?.isActive("bulletList") ? "bg-slate-700 text-white" : "text-slate-400"}`}
                          >
                            <List className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                            className={`p-1.5 rounded hover:bg-slate-700 transition-colors ${editor?.isActive("orderedList") ? "bg-slate-700 text-white" : "text-slate-400"}`}
                          >
                            <ListOrdered className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <EditorContent editor={editor} />
                      </div>
                      <Button
                        onClick={handleSendReply}
                        disabled={isSending || !editor || editor.isEmpty}
                        className="mt-3 w-full bg-[#6b952a] hover:bg-[#7aaa30] text-white disabled:opacity-50"
                      >
                        {isSending ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <MessageSquareReply className="w-4 h-4" />
                            Send Reply
                          </span>
                        )}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
