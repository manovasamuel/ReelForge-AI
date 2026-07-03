"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { showToast } from "@/components/ui/toast";
import { ContentItemCard } from "./content-item-card";
import type {
  CollectedContentItem,
  CategoryOption,
  FilterOption,
  SortOption,
} from "@/types/content-collection";
import {
  Film,
  FileText,
  Layers,
  Image as ImageIcon,
  Video,
  Search,
  CheckCircle2,
  Sparkles,
  BarChart3,
  TrendingUp,
  Eye,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentCollectionDashboardProps {
  items: CollectedContentItem[];
  competitorUsername: string;
  onAnalyzeSelected?: (items: CollectedContentItem[]) => void;
}

export function ContentCollectionDashboard({
  items,
  competitorUsername,
  onAnalyzeSelected,
}: ContentCollectionDashboardProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<CategoryOption>("all");
  const [activeFilter, setActiveFilter] = useState<FilterOption>("all");
  const [sortBy, setSortBy] = useState<SortOption>("views");
  const [searchQuery, setSearchQuery] = useState("");

  const MAX_SELECTION = 20;

  // 1. Collection Statistics (Additional Requirement 2)
  const stats = useMemo(() => {
    const total = items.length;
    const reelsCount = items.filter((i) => i.type === "reel").length;
    const postsCount = items.filter((i) => i.type === "post").length;
    const totalViews = items.reduce((acc, i) => acc + i.views, 0);
    const avgViews = total > 0 ? Math.round(totalViews / total) : 0;
    const highestViews = total > 0 ? Math.max(...items.map((i) => i.views)) : 0;

    // Calculate newest content age
    let newestAge = "2h ago";
    if (total > 0) {
      const timestamps = items.map((i) => new Date(i.publishDate).getTime());
      const maxTime = Math.max(...timestamps);
      const diffHours = Math.round((Date.now() - maxTime) / (1000 * 60 * 60));
      if (diffHours < 24) newestAge = `${Math.max(1, diffHours)}h ago`;
      else newestAge = `${Math.round(diffHours / 24)}d ago`;
    }

    return {
      total,
      reelsCount,
      postsCount,
      avgViews,
      highestViews,
      newestAge,
    };
  }, [items]);

  // 2. Filter, Search & Sort Logic
  const filteredAndSortedItems = useMemo(() => {
    return items
      .filter((item) => {
        // Category filtering (Additional Requirement 1)
        if (activeCategory === "reels" && item.type !== "reel") return false;
        if (activeCategory === "posts" && item.type !== "post") return false;
        if (activeCategory === "carousel" && item.type !== "carousel") return false;
        if (activeCategory === "images" && item.type !== "image") return false;
        if (activeCategory === "videos" && item.type !== "video") return false;

        // Filter option filtering (Additional Requirement 1)
        if (activeFilter === "pinned" && !item.isPinned) return false;
        if (activeFilter === "high-engagement" && item.views < stats.avgViews * 1.2) return false;

        // Search Query filtering
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesCaption = item.caption.toLowerCase().includes(q);
          const matchesHashtags = item.hashtags.some((h) => h.toLowerCase().includes(q));
          const matchesDate = item.publishDate.toLowerCase().includes(q);
          if (!matchesCaption && !matchesHashtags && !matchesDate) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "likes":
            return b.likes - a.likes;
          case "comments":
            return b.comments - a.comments;
          case "newest":
            return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
          case "oldest":
            return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
          case "views":
          default:
            return b.views - a.views;
        }
      });
  }, [items, activeCategory, activeFilter, searchQuery, sortBy, stats.avgViews]);

  // 3. Selection Summary metrics (Additional Requirement 4)
  const selectionSummary = useMemo(() => {
    const selectedItems = items.filter((i) => selectedIds.includes(i.id));
    const count = selectedItems.length;
    const totalViews = selectedItems.reduce((acc, i) => acc + i.views, 0);
    const avgLikes = count > 0 ? Math.round(selectedItems.reduce((acc, i) => acc + i.likes, 0) / count) : 0;
    const avgComments = count > 0 ? Math.round(selectedItems.reduce((acc, i) => acc + i.comments, 0) / count) : 0;

    // Calculate approximate average engagement rate percentage
    let avgEngRate = 0;
    if (count > 0) {
      const totalEng = selectedItems.reduce((acc, i) => acc + i.likes + i.comments, 0);
      avgEngRate = Number(((totalEng / Math.max(1, totalViews)) * 100).toFixed(1));
    }

    return { count, totalViews, avgLikes, avgComments, avgEngRate };
  }, [items, selectedIds]);

  function handleToggleSelect(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : prev.length < MAX_SELECTION ? [...prev, id] : prev
    );
  }

  function handleSelectAllVisible() {
    const visibleIds = filteredAndSortedItems.slice(0, MAX_SELECTION).map((i) => i.id);
    setSelectedIds(visibleIds);
  }

  function handleClearSelection() {
    setSelectedIds([]);
  }

  function handleAnalyzeSelected() {
    if (selectedIds.length === 0) return;
    if (onAnalyzeSelected) {
      const selectedItems = items.filter((i) => selectedIds.includes(i.id));
      onAnalyzeSelected(selectedItems);
      return;
    }
    showToast(
      "Coming in Phase 6",
      `Deep AI Pattern Extraction & Reel Intelligence for ${selectedIds.length} selected items will be available in Phase 6.`
    );
  }

  const formatNum = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(1)}K` : n.toLocaleString();

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. COLLECTION STATISTICS (Additional Requirement 2) */}
      <Card className="border-violet-500/40 bg-gradient-to-br from-violet-950/30 via-card/90 to-card/90 p-6 shadow-xl shadow-violet-950/20 backdrop-blur-md">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/20 text-violet-300">
                <BarChart3 className="h-4 w-4" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
                Content Library Benchmarks: @{competitorUsername}
              </h3>
            </div>
            <Badge className="bg-violet-500/20 text-violet-300 border border-violet-500/30">
              {stats.total} Media Items Extracted
            </Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Total Content</p>
              <p className="mt-1 text-lg font-bold text-foreground">{stats.total} Posts</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Reels Volume</p>
              <p className="mt-1 text-lg font-bold text-violet-400">{stats.reelsCount} Reels</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Posts Volume</p>
              <p className="mt-1 text-lg font-bold text-foreground">{stats.postsCount} Posts</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Average Views</p>
              <p className="mt-1 text-lg font-bold text-fuchsia-400">{formatNum(stats.avgViews)}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Highest Views</p>
              <p className="mt-1 text-lg font-bold text-emerald-400">{formatNum(stats.highestViews)}</p>
            </div>
            <div className="rounded-xl border border-border/40 bg-card/60 p-3.5">
              <p className="text-xs font-medium text-muted-foreground">Newest Content Age</p>
              <p className="mt-1 text-lg font-bold text-violet-300">{stats.newestAge}</p>
            </div>
          </div>
        </div>
      </Card>

      {/* 2. INTERACTIVE MULTI-SELECTION SUMMARY BAR (Additional Requirement 4) */}
      <Card
        className={cn(
          "sticky top-20 z-40 border p-4 transition-all duration-300 backdrop-blur-xl shadow-xl",
          selectionSummary.count > 0
            ? "border-violet-500 bg-gradient-to-r from-violet-950/90 via-card/95 to-card/95 shadow-violet-950/40"
            : "border-border/60 bg-card/80"
        )}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white font-bold text-xs">
                {selectionSummary.count}
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">Selected Items</span>
                <span className="text-xs text-muted-foreground ml-1.5">({selectionSummary.count} / {MAX_SELECTION})</span>
              </div>
            </div>

            {selectionSummary.count > 0 && (
              <>
                <div className="hidden h-6 w-px bg-border sm:block" />

                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 text-violet-300">
                    <Eye className="h-3.5 w-3.5" />
                    <span>Total Views: {formatNum(selectionSummary.totalViews)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-rose-300">
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>Avg Likes: {formatNum(selectionSummary.avgLikes)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Avg Engagement: {selectionSummary.avgEngRate}%</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectionSummary.count === 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAllVisible}
                className="text-xs border-violet-500/30 hover:bg-violet-500/10"
              >
                Select Top {Math.min(filteredAndSortedItems.length, MAX_SELECTION)} Visible
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearSelection}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Clear Selection
              </Button>
            )}

            <Button
              disabled={selectionSummary.count === 0}
              onClick={handleAnalyzeSelected}
              className="bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-xs shadow-md shadow-violet-600/20 hover:opacity-95"
            >
              Analyze Selected Content →
            </Button>
          </div>
        </div>
      </Card>

      {/* 3. CATEGORIES, FILTERS, SEARCH & SORTING (Additional Requirement 1) */}
      <Card className="border-border/60 bg-card/80 p-5 backdrop-blur-md space-y-4">
        {/* Row 1: Categories Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
            Content Format Category:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All Media", icon: FileText },
              { id: "reels", label: "Reels", icon: Film },
              { id: "posts", label: "Posts", icon: FileText },
              { id: "carousel", label: "Carousel", icon: Layers },
              { id: "images", label: "Images", icon: ImageIcon },
              { id: "videos", label: "Videos", icon: Video },
            ].map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as CategoryOption)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer",
                    isActive
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 2: Filters Bar */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-border/40">
          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted-foreground shrink-0">
            <Filter className="h-3 w-3 text-violet-400" />
            <span>Filter By Attribute:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "No Filter" },
              { id: "pinned", label: "Pinned Posts" },
              { id: "high-engagement", label: "High Engagement" },
            ].map((filt) => {
              const isActive = activeFilter === filt.id;
              return (
                <button
                  key={filt.id}
                  onClick={() => setActiveFilter(filt.id as FilterOption)}
                  className={cn(
                    "rounded-lg px-3 py-1 text-xs font-medium transition-all cursor-pointer",
                    isActive
                      ? "bg-fuchsia-600/20 text-fuchsia-300 border border-fuchsia-500/40"
                      : "bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                  )}
                >
                  {filt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Search & Sort Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-border/40">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search captions, hashtags, or publish date..."
              className="pl-9 h-9 text-xs bg-muted/30 border-border/60"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <ArrowUpDown className="h-3.5 w-3.5 text-violet-400" />
              <span>Sort:</span>
            </span>
            <div className="flex gap-1">
              {[
                { id: "views", label: "Views" },
                { id: "likes", label: "Likes" },
                { id: "comments", label: "Comments" },
                { id: "newest", label: "Newest" },
                { id: "oldest", label: "Oldest" },
              ].map((srt) => (
                <button
                  key={srt.id}
                  onClick={() => setSortBy(srt.id as SortOption)}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                    sortBy === srt.id
                      ? "bg-violet-500/20 text-violet-300 border border-violet-500/40"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  {srt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* 4. CONTENT LIBRARY GRID */}
      {filteredAndSortedItems.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed border-border/60">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <h4 className="text-base font-bold text-foreground">No Media Found Matching Filters</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm">
            Try resetting your format categories, attribute filters, or search query to explore all collected items.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActiveCategory("all");
              setActiveFilter("all");
              setSearchQuery("");
            }}
            className="mt-4 text-xs"
          >
            Reset All Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredAndSortedItems.map((item) => (
            <ContentItemCard
              key={item.id}
              item={item}
              isSelected={selectedIds.includes(item.id)}
              onToggleSelect={handleToggleSelect}
              canSelectMore={selectedIds.length < MAX_SELECTION}
            />
          ))}
        </div>
      )}
    </div>
  );
}
