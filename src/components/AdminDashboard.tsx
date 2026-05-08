"use client";

import { useState, useEffect } from "react";
import { Comment } from "@/types";
import AdminLogin from "./AdminLogin";

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [announcement, setAnnouncement] = useState("");
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Comment | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [commentsRes, annRes] = await Promise.all([
        fetch("/api/admin/comments"),
        fetch("/api/admin/announcement"),
      ]);

      if (commentsRes.ok) {
        const data = await commentsRes.json();
        setComments(data.comments);
        setAuthenticated(true);
      } else {
        setAuthenticated(false);
      }

      if (annRes.ok) {
        const ann = await annRes.json();
        setAnnouncement(ann.announcement);
      }
    } catch (e) {
      console.error(e);
      setAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = () => {
    setLoading(true);
    fetchAdminData();
  };

  const handleUpdate = async (id: string, updates: Partial<Comment>) => {
    try {
      const res = await fetch(`/api/admin/comments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        setComments((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
        setEditing(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Soft delete this packet?")) return;
    try {
      const res = await fetch(`/api/admin/comments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setComments((prev) => prev.map((c) => (c.id === id ? { ...c, isDeleted: true } : c)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveAnnouncement = async () => {
    try {
      const res = await fetch("/api/admin/announcement", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ announcement }),
      });
      if (res.ok) {
        alert("Announcement updated");
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="text-terminal-green p-8 text-center animate-pulse">
        &gt; Authenticating...
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <pre className="text-terminal-red text-xs sm:text-sm leading-tight mb-2">
{`╔══════════════════════════════════════╗
║     ADMIN CONSOLE /c0ns1e            ║
║     [ROOT ACCESS GRANTED]            ║
╚══════════════════════════════════════╝`}
        </pre>
      </header>

      <div className="terminal-card mb-6">
        <div className="text-terminal-amber text-xs mb-2">[ANNOUNCEMENT CONFIG]</div>
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          rows={3}
          className="terminal-input resize-none mb-2"
        />
        <button onClick={handleSaveAnnouncement} className="terminal-btn text-xs">
          Update Announcement
        </button>
      </div>

      <div className="space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className={`terminal-card border-l-4 ${
              c.isDeleted
                ? "border-l-terminal-muted opacity-60"
                : c.isPinned
                ? "border-l-terminal-amber"
                : "border-l-terminal-green"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
              <span className="text-terminal-green font-bold">{c.nickname}</span>
              <span className="text-terminal-muted">
                {new Date(c.createdAt).toLocaleString("zh-CN")}
              </span>
              {c.isPinned && <span className="text-terminal-amber">[PINNED]</span>}
              {c.isDeleted && <span className="text-terminal-red">[DELETED]</span>}
            </div>
            {editing?.id === c.id ? (
              <div className="mb-2">
                <textarea
                  value={editing.content}
                  onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                  rows={3}
                  className="terminal-input resize-none mb-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(c.id, { content: editing.content })}
                    className="terminal-btn text-xs"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="terminal-btn text-xs border-terminal-red text-terminal-red hover:bg-terminal-red/20"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm mb-2 whitespace-pre-wrap">{c.content}</div>
            )}
            <div className="flex gap-3 text-xs">
              <button
                onClick={() => handleUpdate(c.id, { isPinned: !c.isPinned })}
                className="text-terminal-amber hover:underline"
              >
                {c.isPinned ? "Unpin" : "Pin"}
              </button>
              <button onClick={() => setEditing(c)} className="text-terminal-green hover:underline">
                Edit
              </button>
              {!c.isDeleted && (
                <button
                  onClick={() => handleDelete(c.id)}
                  className="text-terminal-red hover:underline"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
