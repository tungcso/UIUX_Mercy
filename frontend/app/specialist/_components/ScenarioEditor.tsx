"use client";

import { useState } from "react";
import {
  GitBranch,
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Thermometer,
  ArrowRight,
  X,
  Save,
  GripVertical,
  CornerDownRight,
  FilePlus2,
} from "lucide-react";

type NodeType = "question" | "action" | "warning" | "end";

type ScenarioNode = {
  id: string;
  type: NodeType;
  label: string;
  content: string;
  threshold?: string;
  children: string[];
};

const initialNodes: ScenarioNode[] = [
  {
    id: "n1",
    type: "question",
    label: "Câu hỏi khởi đầu",
    content: "Bạn đang cảm thấy thế nào? Hãy mô tả triệu chứng chính.",
    children: ["n2", "n3"],
  },
  {
    id: "n2",
    type: "question",
    label: "Kiểm tra nhiệt độ",
    content: "Nhiệt độ cơ thể của bạn hiện tại là bao nhiêu?",
    threshold: "Sốt > 38.5°C",
    children: ["n4", "n5"],
  },
  {
    id: "n3",
    type: "action",
    label: "Tư vấn triệu chứng khác",
    content: "Phân loại và tư vấn theo nhóm triệu chứng được báo cáo.",
    children: ["n6"],
  },
  {
    id: "n4",
    type: "warning",
    label: "⚠️ Cảnh báo Sốt cao",
    content: "Sốt > 39°C + kéo dài 3 ngày → Cảnh báo đi viện ngay.",
    threshold: "Sốt > 39°C & > 3 ngày",
    children: [],
  },
  {
    id: "n5",
    type: "action",
    label: "Hướng dẫn tự điều trị",
    content: "Uống paracetamol, nghỉ ngơi, uống nhiều nước. Theo dõi 24h.",
    children: [],
  },
  {
    id: "n6",
    type: "end",
    label: "Kết thúc tư vấn",
    content:
      "Cảm ơn bạn đã sử dụng dịch vụ. Liên hệ bác sĩ nếu triệu chứng nặng hơn.",
    children: [],
  },
];

const nodeTypeStyle: Record<
  NodeType,
  { bg: string; border: string; badge: string; badgeText: string; dragBorder: string }
> = {
  question: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    badgeText: "Câu hỏi",
    dragBorder: "border-blue-400",
  },
  action: {
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    badgeText: "Hành động",
    dragBorder: "border-emerald-400",
  },
  warning: {
    bg: "bg-rose-50",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-700",
    badgeText: "Cảnh báo",
    dragBorder: "border-rose-400",
  },
  end: {
    bg: "bg-slate-50",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-600",
    badgeText: "Kết thúc",
    dragBorder: "border-slate-400",
  },
};

// ── helpers ────────────────────────────────────────────────────────────────

function getDescendants(nodeId: string, nodeList: ScenarioNode[]): Set<string> {
  const map = new Map(nodeList.map((n) => [n.id, n]));
  const result = new Set<string>();
  const queue = [nodeId];
  while (queue.length) {
    const id = queue.shift()!;
    const node = map.get(id);
    if (!node) continue;
    node.children.forEach((c) => {
      if (!result.has(c)) {
        result.add(c);
        queue.push(c);
      }
    });
  }
  return result;
}

type FlatItem = {
  node: ScenarioNode;
  depth: number;
  isLastChild: boolean;
  parentHasMore: boolean[];
  isGhost?: boolean;
};

function flattenDFS(nodes: ScenarioNode[], ghostNode?: ScenarioNode | null): FlatItem[] {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const childSet = new Set(nodes.flatMap((n) => n.children));
  const roots = nodes.filter((n) => !childSet.has(n.id));
  const flat: FlatItem[] = [];

  function dfs(
    id: string,
    depth: number,
    isLastChild: boolean,
    parentHasMore: boolean[],
    isGhostNode?: boolean
  ) {
    const node = nodeMap.get(id);
    if (!node) return;
    flat.push({ node, depth, isLastChild, parentHasMore, isGhost: isGhostNode });
    const children = [...node.children];
    // If this node is the ghost's parent, append ghost as last child
    const ghostIsChildOfThis = ghostNode && node.children.includes("ghost");
    children.forEach((childId, idx) => {
      const last = idx === node.children.length - 1 && !ghostIsChildOfThis;
      dfs(childId, depth + 1, last, [...parentHasMore, !isLastChild]);
    });
  }

  roots.forEach((root, idx) => {
    dfs(root.id, 0, idx === roots.length - 1, []);
  });

  // If ghost has a parent, it was injected via the parent's children list
  // We handle ghost rendering separately at the end of flattenDFS
  if (ghostNode) {
    // Find parent depth to determine ghost depth
    const parentFlat = flat.find((fi) => fi.node.id === (ghostNode as any)._parentId);
    const depth = parentFlat ? parentFlat.depth + 1 : 0;
    const parentHasMore = parentFlat ? [...parentFlat.parentHasMore, !parentFlat.isLastChild] : [];

    // insert ghost after all children of its parent
    if ((ghostNode as any)._parentId) {
      // find insertion point: after the last descendant of parent
      const parentIdx = flat.findIndex((fi) => fi.node.id === (ghostNode as any)._parentId);
      if (parentIdx >= 0) {
        // find last descendant index
        const parentFlatItem = flat[parentIdx];
        let insertIdx = parentIdx + 1;
        while (
          insertIdx < flat.length &&
          flat[insertIdx].depth > parentFlatItem.depth
        ) {
          insertIdx++;
        }
        flat.splice(insertIdx, 0, {
          node: ghostNode,
          depth,
          isLastChild: true,
          parentHasMore,
          isGhost: true,
        });
      }
    } else {
      // ghost is a root node — append at end
      flat.push({
        node: ghostNode,
        depth: 0,
        isLastChild: true,
        parentHasMore: [],
        isGhost: true,
      });
    }
  }

  return flat;
}

// ── component ──────────────────────────────────────────────────────────────

type PanelMode = "idle" | "edit" | "add";

export default function ScenarioEditor() {
  const [nodes, setNodes] = useState<ScenarioNode[]>(initialNodes);
  const [selectedNode, setSelectedNode] = useState<ScenarioNode | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>("idle");
  const [newNode, setNewNode] = useState({
    type: "question" as NodeType,
    label: "",
    content: "",
    threshold: "",
    parentId: "" as string,
  });
  const [savedNotice, setSavedNotice] = useState(false);
  // node the user clicked while in add-mode with a partially filled form
  const [pendingSelectNode, setPendingSelectNode] = useState<ScenarioNode | null>(null);

  // drag state
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropOverRoot, setDropOverRoot] = useState(false);

  const deadEnds = nodes.filter(
    (n) => n.type !== "end" && n.children.length === 0
  );

  // Build ghost node for preview
  const ghostNode: (ScenarioNode & { _parentId?: string }) | null =
    panelMode === "add"
      ? {
        id: "ghost",
        type: newNode.type,
        label: newNode.label || "Tên nút mới...",
        content: newNode.content || "Nội dung phản hồi...",
        threshold: newNode.threshold || undefined,
        children: [],
        _parentId: newNode.parentId || undefined,
      }
      : null;

  // ── drag handlers ────────────────────────────────────────────────────────

  const handleDragStart = (e: React.DragEvent, nodeId: string) => {
    setDragNodeId(nodeId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => { }, 0);
  };

  const handleDragOverNode = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragNodeId || dragNodeId === targetId) return;
    const desc = getDescendants(dragNodeId, nodes);
    if (desc.has(targetId)) return;
    e.dataTransfer.dropEffect = "move";
    setDropTargetId(targetId);
    setDropOverRoot(false);
  };

  const handleDragOverRoot = (e: React.DragEvent) => {
    e.preventDefault();
    setDropTargetId(null);
    setDropOverRoot(true);
  };

  const handleDropOnNode = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragNodeId || dragNodeId === targetId) {
      resetDrag();
      return;
    }
    const desc = getDescendants(dragNodeId, nodes);
    if (desc.has(targetId)) {
      resetDrag();
      return;
    }
    setNodes((prev) => {
      let updated = prev.map((n) => ({
        ...n,
        children: n.children.filter((c) => c !== dragNodeId),
      }));
      updated = updated.map((n) =>
        n.id === targetId && !n.children.includes(dragNodeId)
          ? { ...n, children: [...n.children, dragNodeId] }
          : n
      );
      return updated;
    });
    resetDrag();
  };

  const handleDropOnRoot = (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragNodeId) { resetDrag(); return; }
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        children: n.children.filter((c) => c !== dragNodeId),
      }))
    );
    resetDrag();
  };

  const resetDrag = () => {
    setDragNodeId(null);
    setDropTargetId(null);
    setDropOverRoot(false);
  };

  // ── CRUD ─────────────────────────────────────────────────────────────────

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleAddNode = () => {
    if (!newNode.label || !newNode.content) return;
    const id = `n${Date.now()}`;
    setNodes((prev) => {
      const withNew = [
        ...prev,
        {
          id,
          type: newNode.type,
          label: newNode.label,
          content: newNode.content,
          threshold: newNode.threshold || undefined,
          children: [],
        },
      ];
      if (newNode.parentId) {
        return withNew.map((n) =>
          n.id === newNode.parentId
            ? { ...n, children: [...n.children, id] }
            : n
        );
      }
      return withNew;
    });
    setNewNode({ type: "question", label: "", content: "", threshold: "", parentId: "" });
    setPendingSelectNode(null);
    setPanelMode("idle");
  };

  const handleCancelAdd = () => {
    setNewNode({ type: "question", label: "", content: "", threshold: "", parentId: "" });
    setPendingSelectNode(null);
    setPanelMode("idle");
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) =>
      prev
        .filter((n) => n.id !== id)
        .map((n) => ({ ...n, children: n.children.filter((c) => c !== id) }))
    );
    if (selectedNode?.id === id) {
      setSelectedNode(null);
      setPanelMode("idle");
    }
  };

  const handleSelectNode = (node: ScenarioNode) => {
    if (panelMode === "add") {
      const hasDraft = !!(newNode.label.trim() || newNode.content.trim());
      if (hasDraft) {
        // form has data → ask user first
        setPendingSelectNode(node);
      } else {
        // form is empty → switch immediately
        setNewNode({ type: "question", label: "", content: "", threshold: "", parentId: "" });
        setPendingSelectNode(null);
        setSelectedNode(node);
        setPanelMode("edit");
      }
      return;
    }
    if (selectedNode?.id === node.id) {
      setSelectedNode(null);
      setPanelMode("idle");
    } else {
      setSelectedNode(node);
      setPanelMode("edit");
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  const flat = flattenDFS(nodes, ghostNode as any);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] font-bold tracking-[-0.03em] text-slate-900">
            Trình chỉnh sửa Kịch bản
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Kéo-thả để sắp xếp cây quyết định • Thả vào nút để ghép làm con
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedNotice && (
            <span className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              Đã lưu kịch bản!
            </span>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedNode(null);
              setPanelMode(panelMode === "add" ? "idle" : "add");
              setNewNode({ type: "question", label: "", content: "", threshold: "", parentId: "" });
            }}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5 ${panelMode === "add"
                ? "bg-slate-700 text-white shadow-slate-500/20 hover:bg-slate-800"
                : "bg-emerald-600 text-white shadow-emerald-500/20 hover:bg-emerald-700"
              }`}
          >
            {panelMode === "add" ? (
              <>
                <X className="h-4 w-4" />
                Hủy thêm nút
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Thêm nút mới
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition-all hover:-translate-y-0.5 hover:bg-emerald-100"
          >
            <Save className="h-4 w-4" />
            Lưu kịch bản
          </button>
        </div>
      </div>

      {/* Dead-end Warning */}
      {deadEnds.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-bold text-amber-700">
              Phát hiện {deadEnds.length} điểm chết trong luồng hội thoại!
            </p>
            <p className="mt-0.5 text-sm text-amber-600">
              Các nút sau không có câu trả lời tiếp theo:{" "}
              <strong>{deadEnds.map((n) => n.label).join(", ")}</strong>
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* ── Tree panel ── */}
        <div className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">
          <div className="mb-4 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-emerald-500" />
            <h2 className="text-[17px] font-bold tracking-[-0.02em] text-slate-900">
              Cây quyết định hội thoại
            </h2>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
              {nodes.length} nút
            </span>
            {panelMode === "add" && (
              <span className="ml-auto flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-700">
                <FilePlus2 className="h-3.5 w-3.5" />
                Đang xem trước nút mới
              </span>
            )}
          </div>

          {/* Drag hint */}
          {dragNodeId && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
              <GripVertical className="h-3.5 w-3.5" />
              Thả vào một nút để ghép làm con • Thả vào vùng trống bên dưới để tách thành root
            </div>
          )}

          <div className="overflow-auto p-1">
            <div className="space-y-1">
              {flat.map(({ node, depth, isLastChild, parentHasMore, isGhost }) => {
                const style = nodeTypeStyle[node.type];
                const isSelected = selectedNode?.id === node.id;
                const isDeadEnd = node.type !== "end" && node.children.length === 0 && !isGhost;
                const isDragging = dragNodeId === node.id;
                const isDropTarget = dropTargetId === node.id;
                const desc = dragNodeId ? getDescendants(dragNodeId, nodes) : new Set<string>();
                const isInvalidTarget =
                  dragNodeId !== null &&
                  (dragNodeId === node.id || desc.has(node.id));

                // Can only add child to non-end, non-ghost nodes
                const canAddChild = !isGhost && node.type !== "end";

                return (
                  <div
                    key={node.id}
                    className="group/row"
                  >
                    <div className="flex items-start">
                      {/* Connector lines */}
                      {depth > 0 && (
                        <div className="flex shrink-0" style={{ width: depth * 28 }}>
                          {parentHasMore.map((hasSibling, i) => (
                            <div
                              key={i}
                              className="relative flex w-7 shrink-0 justify-center"
                            >
                              {hasSibling && (
                                <div className="absolute inset-y-0 left-3.5 w-px bg-slate-200" />
                              )}
                            </div>
                          ))}
                          <div className="relative flex w-7 shrink-0 justify-center">
                            <div
                              className="absolute left-3.5 w-px bg-slate-200"
                              style={{ top: 0, bottom: isLastChild ? "50%" : 0 }}
                            />
                            <div
                              className={`absolute ${isGhost ? "bg-emerald-300" : "bg-slate-200"}`}
                              style={{
                                top: "calc(50% - 0.5px)",
                                left: "0.875rem",
                                right: 0,
                                height: 1,
                              }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Node card */}
                      <div
                        draggable={!isGhost}
                        onDragStart={!isGhost ? (e) => handleDragStart(e, node.id) : undefined}
                        onDragEnd={!isGhost ? resetDrag : undefined}
                        onDragOver={!isGhost ? (e) => {
                          if (!isInvalidTarget) handleDragOverNode(e, node.id);
                          else e.preventDefault();
                        } : undefined}
                        onDragLeave={!isGhost ? () => {
                          if (dropTargetId === node.id) setDropTargetId(null);
                        } : undefined}
                        onDrop={!isGhost ? (e) => handleDropOnNode(e, node.id) : undefined}
                        onClick={!isGhost ? () => handleSelectNode(node) : undefined}
                        className={[
                          "group relative mb-1 flex-1 rounded-2xl border transition-all",
                          isGhost
                            ? "cursor-default"
                            : "cursor-grab active:cursor-grabbing",
                          isGhost
                            ? `${style.bg} ${style.border} border-dashed opacity-70 ring-2 ring-emerald-400 ring-offset-1 shadow-md shadow-emerald-500/10`
                            : isDropTarget
                              ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/20 ring-2 ring-emerald-400 ring-offset-1"
                              : isInvalidTarget && dragNodeId
                                ? "border-dashed border-slate-300 opacity-40"
                                : isDragging
                                  ? "opacity-50 scale-[0.98] border-dashed " + style.dragBorder
                                  : isSelected
                                    ? "border " + style.border + " ring-2 ring-emerald-500 ring-offset-1 " + style.bg
                                    : "border " + style.border + " hover:shadow-md " + style.bg,
                          isDeadEnd && !isDropTarget ? "border-amber-300" : "",
                        ]
                          .join(" ")
                          .trim()}
                      >
                        {/* Ghost label overlay */}
                        {isGhost && (
                          <div className="pointer-events-none absolute right-3 top-2.5">
                            <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow">
                              <FilePlus2 className="h-2.5 w-2.5" />
                              Xem trước
                            </span>
                          </div>
                        )}

                        {/* Drop-here overlay label */}
                        {isDropTarget && (
                          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-2xl bg-emerald-500/10">
                            <span className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-md">
                              <CornerDownRight className="h-3.5 w-3.5" />
                              Thả để ghép làm con
                            </span>
                          </div>
                        )}

                        <div className="flex w-full items-start gap-3 px-4 py-3 text-left">
                          {/* Drag handle + quick-add child */}
                          {!isGhost && (
                            <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1">
                              <GripVertical className="h-4 w-4 text-slate-300 group-hover:text-slate-400" />
                              {canAddChild && (
                                <button
                                  type="button"
                                  title={`Thêm nút con vào "${node.label}"`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedNode(null);
                                    setNewNode({
                                      type: "question",
                                      label: "",
                                      content: "",
                                      threshold: "",
                                      parentId: node.id,
                                    });
                                    setPanelMode("add");
                                  }}
                                  className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30 opacity-0 pointer-events-none transition-all group-hover:opacity-100 group-hover:pointer-events-auto hover:scale-110 hover:bg-emerald-600"
                                >
                                  <Plus className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          )}

                          {/* Depth badge */}
                          {depth > 0 && (
                            <span className="mt-0.5 shrink-0 rounded-lg bg-white/70 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 ring-1 ring-slate-200">
                              L{depth}
                            </span>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${style.badge}`}
                              >
                                {style.badgeText}
                              </span>
                              <span className={`text-sm font-bold ${isGhost && !newNode.label ? "text-slate-400 italic" : "text-slate-800"}`}>
                                {node.label}
                              </span>
                              {isDeadEnd && (
                                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-600">
                                  ⚠ Điểm chết
                                </span>
                              )}
                            </div>
                            <p className={`mt-1 text-sm line-clamp-2 ${isGhost && !newNode.content ? "text-slate-400 italic" : "text-slate-600"}`}>
                              {node.content}
                            </p>
                            {node.threshold && (
                              <div className="mt-2 flex items-center gap-1.5">
                                <Thermometer className="h-3.5 w-3.5 text-rose-500" />
                                <span className="text-xs font-semibold text-rose-600">
                                  Ngưỡng: {node.threshold}
                                </span>
                              </div>
                            )}
                            {node.children.length > 0 && (
                              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                                <ArrowRight className="h-3 w-3" />
                                <span>{node.children.length} nhánh rẽ tiếp theo</span>
                              </div>
                            )}
                          </div>
                          {!isGhost && (
                            <ChevronRight
                              className={`mt-0.5 h-4 w-4 shrink-0 transition-transform ${isSelected
                                  ? "rotate-90 text-emerald-500"
                                  : "text-slate-300"
                                }`}
                            />
                          )}
                        </div>

                        {/* Delete button */}
                        {!isGhost && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(node.id);
                            }}
                            className="absolute right-2 top-2 hidden rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500 group-hover:flex"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Root drop zone */}
            <div
              onDragOver={handleDragOverRoot}
              onDragLeave={() => setDropOverRoot(false)}
              onDrop={handleDropOnRoot}
              className={`mt-3 flex min-h-14 items-center justify-center rounded-2xl border-2 border-dashed transition-all ${dropOverRoot
                  ? "border-emerald-400 bg-emerald-50 shadow-md shadow-emerald-500/10"
                  : dragNodeId
                    ? "border-slate-300 bg-slate-50/50"
                    : "border-transparent"
                }`}
            >
              {dragNodeId && (
                <p
                  className={`text-xs font-semibold transition-colors ${dropOverRoot ? "text-emerald-600" : "text-slate-400"
                    }`}
                >
                  {dropOverRoot
                    ? "✓ Thả để tách thành nút gốc (root)"
                    : "Hoặc thả vào đây để tách khỏi cha"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Right panel: Edit or Add ── */}
        <div className="rounded-[1.65rem] border border-slate-200/80 bg-white px-6 py-6 shadow-[0_18px_45px_rgba(15,23,42,0.04)]">

          {/* ── ADD MODE ── */}
          {panelMode === "add" && (
            <div>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <FilePlus2 className="h-4 w-4" />
                </div>
                <h2 className="text-[17px] font-bold tracking-[-0.02em] text-slate-900">
                  Tạo nút mới
                </h2>
              </div>

              <p className="mb-4 text-xs text-slate-400 leading-5">
                Điền thông tin bên dưới — nút xem trước sẽ cập nhật ngay trong cây kịch bản.
              </p>

              {/* ── Discard-draft warning ── */}
              {pendingSelectNode && (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <p className="text-sm font-semibold text-amber-800">
                    Bạn vừa chọn nút <span className="font-bold">&ldquo;{pendingSelectNode.label}&rdquo;</span>.
                  </p>
                  <p className="mt-0.5 text-xs text-amber-600">
                    Thông tin đang điền sẽ bị mất nếu hủy tạo nút mới.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        // confirm: discard draft, switch to edit
                        setNewNode({ type: "question", label: "", content: "", threshold: "", parentId: "" });
                        setSelectedNode(pendingSelectNode);
                        setPendingSelectNode(null);
                        setPanelMode("edit");
                      }}
                      className="flex-1 rounded-xl bg-amber-500 py-2 text-xs font-bold text-white shadow-sm transition-all hover:bg-amber-600"
                    >
                      Hủy tạo nút
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingSelectNode(null)}
                      className="flex-1 rounded-xl border border-amber-200 bg-white py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-50"
                    >
                      Tiếp tục nhập
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {/* Type selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Loại nút
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(["question", "action", "warning", "end"] as NodeType[]).map(
                      (t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewNode((p) => ({ ...p, type: t }))}
                          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition-all ${newNode.type === t
                              ? `${nodeTypeStyle[t].badge} border-transparent ring-2 ring-emerald-400`
                              : "border-slate-200 text-slate-500 hover:border-slate-300"
                            }`}
                        >
                          {nodeTypeStyle[t].badgeText}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Parent selector */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Nút cha (tùy chọn)
                  </label>
                  <select
                    value={newNode.parentId}
                    onChange={(e) =>
                      setNewNode((p) => ({ ...p, parentId: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  >
                    <option value="">— Không có (nút gốc) —</option>
                    {nodes
                      .filter((n) => n.type !== "end")
                      .map((n) => (
                        <option key={n.id} value={n.id}>
                          [{nodeTypeStyle[n.type].badgeText}] {n.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Nhãn *
                  </label>
                  <input
                    type="text"
                    value={newNode.label}
                    onChange={(e) =>
                      setNewNode((p) => ({ ...p, label: e.target.value }))
                    }
                    placeholder="VD: Kiểm tra nhiệt độ..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Nội dung phản hồi *
                  </label>
                  <textarea
                    value={newNode.content}
                    onChange={(e) =>
                      setNewNode((p) => ({ ...p, content: e.target.value }))
                    }
                    placeholder="Nội dung chatbot sẽ phản hồi..."
                    className="min-h-20 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                {(newNode.type === "question" || newNode.type === "warning") && (
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                      Ngưỡng cảnh báo
                    </label>
                    <input
                      type="text"
                      value={newNode.threshold}
                      onChange={(e) =>
                        setNewNode((p) => ({ ...p, threshold: e.target.value }))
                      }
                      placeholder="VD: Sốt > 39°C..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleAddNode}
                    disabled={!newNode.label || !newNode.content}
                    className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                  >
                    Thêm vào kịch bản
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── EDIT MODE ── */}
          {panelMode === "edit" && selectedNode && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-[17px] font-bold tracking-[-0.02em] text-slate-900">
                  Chi tiết nút
                </h2>
                <button
                  type="button"
                  onClick={() => { setSelectedNode(null); setPanelMode("idle"); }}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Loại nút
                  </label>
                  <span
                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${nodeTypeStyle[selectedNode.type].badge
                      }`}
                  >
                    {nodeTypeStyle[selectedNode.type].badgeText}
                  </span>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Nhãn
                  </label>
                  <input
                    type="text"
                    key={selectedNode.id + "-label"}
                    defaultValue={selectedNode.label}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (!val) return;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedNode.id ? { ...n, label: val } : n
                        )
                      );
                      setSelectedNode((s) => (s ? { ...s, label: val } : s));
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Nội dung phản hồi
                  </label>
                  <textarea
                    key={selectedNode.id + "-content"}
                    defaultValue={selectedNode.content}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (!val) return;
                      setNodes((prev) =>
                        prev.map((n) =>
                          n.id === selectedNode.id ? { ...n, content: val } : n
                        )
                      );
                      setSelectedNode((s) => (s ? { ...s, content: val } : s));
                    }}
                    className="min-h-24 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm leading-6 text-slate-800 outline-none transition focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </div>

                {(selectedNode.type === "question" ||
                  selectedNode.type === "warning") && (
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                        Ngưỡng cảnh báo
                      </label>
                      <input
                        type="text"
                        key={selectedNode.id + "-threshold"}
                        defaultValue={selectedNode.threshold || ""}
                        placeholder="VD: Sốt > 39°C + Kéo dài 3 ngày"
                        onBlur={(e) => {
                          const val = e.target.value.trim();
                          setNodes((prev) =>
                            prev.map((n) =>
                              n.id === selectedNode.id
                                ? { ...n, threshold: val || undefined }
                                : n
                            )
                          );
                          setSelectedNode((s) =>
                            s ? { ...s, threshold: val || undefined } : s
                          );
                        }}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-rose-300 focus:ring-4 focus:ring-rose-100"
                      />
                      <p className="mt-1.5 text-xs text-slate-400">
                        Khi điều kiện này thỏa mãn, chatbot sẽ kích hoạt cảnh báo khẩn.
                      </p>
                    </div>
                  )}

                {/* Children list */}
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                    Các nút con ({selectedNode.children.length})
                  </label>
                  {selectedNode.children.length > 0 ? (
                    <div className="space-y-1.5">
                      {selectedNode.children.map((childId) => {
                        const child = nodes.find((n) => n.id === childId);
                        if (!child) return null;
                        const s = nodeTypeStyle[child.type];
                        return (
                          <div
                            key={childId}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 ${s.bg} ${s.border}`}
                          >
                            <CornerDownRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.badge}`}
                            >
                              {s.badgeText}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-700">
                              {child.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setNodes((prev) =>
                                  prev.map((n) =>
                                    n.id === selectedNode.id
                                      ? {
                                        ...n,
                                        children: n.children.filter(
                                          (c) => c !== childId
                                        ),
                                      }
                                      : n
                                  )
                                );
                                setSelectedNode((s) =>
                                  s
                                    ? {
                                      ...s,
                                      children: s.children.filter(
                                        (c) => c !== childId
                                      ),
                                    }
                                    : s
                                );
                              }}
                              className="rounded-lg p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      Chưa có nút con. Kéo-thả một nút vào đây để ghép.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSave}
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
                >
                  Lưu thay đổi nút
                </button>
              </div>
            </div>
          )}

          {/* ── IDLE MODE ── */}
          {panelMode === "idle" && (
            <div className="flex h-full flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-400">
                <GitBranch className="h-8 w-8" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-700">
                Chọn một nút để chỉnh sửa
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Nhấp để xem chi tiết • Kéo-thả để sắp xếp cây
              </p>
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-left text-xs text-slate-500">
                <p className="font-semibold text-slate-700 mb-1.5">💡 Hướng dẫn kéo-thả</p>
                <ul className="space-y-1 leading-5">
                  <li>• <strong>Kéo</strong> vào nút khác → ghép làm nút con</li>
                  <li>• <strong>Kéo</strong> vào vùng trống cuối → tách thành root</li>
                  <li>• <strong>Nhấp</strong> vào nút → xem &amp; sửa chi tiết</li>
                  <li>• Dùng nút <strong>&quot;Thêm nút mới&quot;</strong> để xem trước ngay trong cây</li>
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPanelMode("add");
                  setNewNode({ type: "question", label: "", content: "", threshold: "", parentId: "" });
                }}
                className="mt-6 flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                <Plus className="h-4 w-4" />
                Thêm nút mới
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
