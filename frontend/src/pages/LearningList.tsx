import React, { useEffect, useMemo, useRef, useState } from "react";
import { apiClient } from "../utils/apiClient";
import { useAuth } from "../contexts/AuthContext";

interface LearningItem {
  id: string;
  user_id: string;
  text: string;
  video_id?: string;
  timestamp: string;
  status: "new" | "learning" | "learned" | string;
  notes?: string;
}

const LearningList: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<LearningItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const pendingNotesUpdates = useRef<Record<string, number>>({});

  const token = useMemo(() => localStorage.getItem("auth_token") || "", []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getLearningList(token);
      setItems(res.data || []);
      setError("");
    } catch (e: any) {
      setError(e?.message || "Failed to load learning list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Removed toggleStatus; using explicit markLearned instead

  const markLearned = async (item: LearningItem) => {
    if (item.status === "learned") return;
    try {
      const res = await apiClient.updateLearningListItem(token, item.id, {
        status: "learned",
      });
      const updated = res.data as LearningItem;
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, status: updated.status } : i
        )
      );
    } catch (e: any) {
      setError(e?.message || "Failed to update status");
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await apiClient.deleteLearningListItem(token, id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (e: any) {
      setError(e?.message || "Failed to delete item");
    }
  };

  const scheduleNotesUpdate = (id: string, notes: string) => {
    // Debounce updates per item
    const existing = pendingNotesUpdates.current[id];
    if (existing) {
      window.clearTimeout(existing);
    }
    const handle = window.setTimeout(async () => {
      try {
        const res = await apiClient.updateLearningListItem(token, id, {
          notes,
        });
        const updated = res.data as LearningItem;
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, notes: updated.notes } : i))
        );
      } catch (e: any) {
        setError(e?.message || "Failed to save notes");
      }
    }, 500);
    pendingNotesUpdates.current[id] = handle as unknown as number;
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Learning List</h2>
        <p>Please sign in to view your learning list.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 16 }}>Learning List</h2>
      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "#f87171", marginBottom: 12 }}>{error}</p>}
      {!loading && items.length === 0 && <p>No items yet.</p>}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              border: "1px solid #2a2a2a",
              borderRadius: 12,
              padding: 16,
              background: "#101010",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: "#e5e7eb" }}>
                  {item.text}
                </div>
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  Added {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  style={{
                    fontSize: 12,
                    color: item.status === "learned" ? "#34d399" : "#9ca3af",
                    textTransform: "capitalize",
                  }}
                >
                  {item.status === "learned" ? "learned" : "new"}
                </span>
                <button
                  onClick={() => markLearned(item)}
                  disabled={item.status === "learned"}
                  title={
                    item.status === "learned"
                      ? "Already learned"
                      : "Mark as learned"
                  }
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    border: "1px solid #374151",
                    background:
                      item.status === "learned" ? "#064e3b" : "#111827",
                    color: item.status === "learned" ? "#34d399" : "#e5e7eb",
                    cursor: item.status === "learned" ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  ✓
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  title="Delete item"
                  style={{
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px solid #7f1d1d",
                    background: "#111827",
                    color: "#fca5a5",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  color: "#9ca3af",
                  display: "block",
                  marginBottom: 6,
                }}
              >
                Notes
              </label>
              <textarea
                defaultValue={item.notes || ""}
                onChange={(e) => scheduleNotesUpdate(item.id, e.target.value)}
                placeholder="Add notes…"
                style={{
                  width: "80%",
                  minHeight: 56,
                  maxHeight: 120,
                  padding: 10,
                  borderRadius: 8,
                  background: "#0b0b0b",
                  border: "1px solid #2a2a2a",
                  color: "#e5e7eb",
                  overflow: "auto",
                  resize: "vertical",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LearningList;
