"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CollectedContentItem } from "@/types/content-collection";
import {
  Film,
  Layers,
  Image as ImageIcon,
  Video,
  FileText,
  Eye,
  Heart,
  MessageCircle,
  Pin,
  Clock,
  Maximize2,
  Calendar,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItemCardProps {
  item: CollectedContentItem;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  canSelectMore: boolean;
}

export function ContentItemCard({
  item,
  isSelected,
  onToggleSelect,
  canSelectMore,
}: ContentItemCardProps) {
  const formattedViews =
    item.views >= 1_000_000
      ? `${(item.views / 1_000_000).toFixed(1)}M`
      : item.views >= 1000
      ? `${(item.views / 1000).toFixed(1)}K`
      : item.views.toLocaleString();

  const formattedLikes =
    item.likes >= 1000
      ? `${(item.likes / 1000).toFixed(1)}K`
      : item.likes.toLocaleString();

  const formattedDate = new Date(item.publishDate).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  function getTypeIcon() {
    switch (item.type) {
      case "reel":
        return <Film className="h-3 w-3 text-violet-400" />;
      case "carousel":
        return <Layers className="h-3 w-3 text-fuchsia-400" />;
      case "video":
        return <Video className="h-3 w-3 text-sky-400" />;
      case "image":
        return <ImageIcon className="h-3 w-3 text-emerald-400" />;
      case "post":
      default:
        return <FileText className="h-3 w-3 text-purple-400" />;
    }
  }

  function handleCheckboxClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isSelected && !canSelectMore) return;
    onToggleSelect(item.id);
  }

  return (
    <Card
      onClick={handleCheckboxClick}
      className={cn(
        "group relative flex flex-col overflow-hidden border transition-all duration-300 cursor-pointer select-none",
        isSelected
          ? "border-violet-500 bg-violet-950/20 shadow-lg shadow-violet-950/40 ring-1 ring-violet-500"
          : "border-border/60 bg-card/70 hover:border-violet-500/50 hover:bg-card hover:shadow-md"
      )}
    >
      {/* Media Thumbnail Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/40">
        <Image
          src={item.thumbnailUrl}
          alt={item.caption.slice(0, 40)}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          unoptimized
        />

        {/* Top Badges */}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
          <div className="flex items-center gap-1.5">
            <Badge className="flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[10px] border border-white/10 px-2 py-0.5 capitalize">
              {getTypeIcon()}
              <span>{item.type}</span>
            </Badge>

            {item.isPinned && (
              <Badge className="flex items-center gap-1 bg-amber-500/90 text-black font-bold text-[10px] px-1.5 py-0.5">
                <Pin className="h-2.5 w-2.5 fill-black" />
                <span>Pinned</span>
              </Badge>
            )}
          </div>

          {/* Interactive Selection Checkbox */}
          <div
            onClick={handleCheckboxClick}
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-md border transition-all",
              isSelected
                ? "border-violet-400 bg-violet-600 text-white shadow-sm scale-110"
                : "border-white/60 bg-black/50 text-transparent hover:border-white"
            )}
            title={isSelected ? "Deselect item" : "Select item for Phase 6"}
          >
            <Check className={cn("h-4 w-4 stroke-[3]", isSelected ? "opacity-100" : "opacity-0")} />
          </div>
        </div>

        {/* Duration / Media Count Overlay */}
        {item.durationSeconds && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <Clock className="h-3 w-3 text-violet-300" />
            <span>{item.durationSeconds}s</span>
          </div>
        )}
        {item.mediaCount && (
          <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-semibold text-white">
            <Layers className="h-3 w-3 text-fuchsia-300" />
            <span>1/{item.mediaCount}</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-4 space-y-3">
        {/* Caption Preview */}
        <p className="line-clamp-2 text-xs text-foreground/90 font-medium leading-relaxed">
          {item.caption}
        </p>

        {/* Metrics Row */}
        <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground pt-1 border-t border-border/40">
          <div className="flex items-center gap-1" title={`${item.views.toLocaleString()} views`}>
            <Eye className="h-3.5 w-3.5 text-violet-400" />
            <span>{formattedViews}</span>
          </div>
          <div className="flex items-center gap-1" title={`${item.likes.toLocaleString()} likes`}>
            <Heart className="h-3.5 w-3.5 text-rose-400" />
            <span>{formattedLikes}</span>
          </div>
          <div className="flex items-center gap-1" title={`${item.comments.toLocaleString()} comments`}>
            <MessageCircle className="h-3.5 w-3.5 text-sky-400" />
            <span>{item.comments}</span>
          </div>
        </div>

        {/* Footer: Date & Quick Preview Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-muted-foreground/80">{formattedDate}</span>

          {/* Quick Preview Dialog (Additional Requirement 3) */}
          <div onClick={(e) => e.stopPropagation()}>
            <Dialog>
              <DialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-[11px] text-violet-300 hover:bg-violet-500/15 hover:text-violet-200"
                  />
                }
              >
                <Maximize2 className="mr-1 h-3 w-3" />
                <span>Quick Preview</span>
              </DialogTrigger>

              <DialogContent className="max-w-2xl bg-card/95 border-violet-500/30 p-6 shadow-2xl backdrop-blur-xl">
                <DialogHeader className="mb-4">
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
                    {getTypeIcon()}
                    <span className="capitalize">{item.type} Content Preview</span>
                    {item.isPinned && (
                      <Badge className="bg-amber-500 text-black text-xs">Pinned</Badge>
                    )}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Large Thumbnail */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
                    <Image
                      src={item.thumbnailUrl}
                      alt={item.caption.slice(0, 40)}
                      fill
                      sizes="400px"
                      className="object-cover"
                      unoptimized
                    />
                    {item.durationSeconds && (
                      <Badge className="absolute bottom-3 right-3 bg-black/80 text-white text-xs">
                        {item.durationSeconds}s Duration
                      </Badge>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4 text-xs">
                    <div>
                      <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                        Publish Date
                      </h4>
                      <p className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                        <Calendar className="h-4 w-4 text-violet-400" />
                        {formattedDate}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 rounded-xl border border-border/40 bg-muted/30 p-3 text-center">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Views</p>
                        <p className="text-sm font-bold text-violet-400">{item.views.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Likes</p>
                        <p className="text-sm font-bold text-rose-400">{item.likes.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Comments</p>
                        <p className="text-sm font-bold text-sky-400">{item.comments.toLocaleString()}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-1">
                        Caption
                      </h4>
                      <p className="text-xs text-foreground/90 leading-relaxed max-h-32 overflow-y-auto rounded-lg border border-border/40 bg-card/60 p-3">
                        {item.caption}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-1.5">
                        Hashtags
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {item.hashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[11px] font-medium text-violet-300 border border-violet-500/20"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Card>
  );
}
