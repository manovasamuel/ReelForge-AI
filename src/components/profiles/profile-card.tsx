import Image from "next/image";
import type { InstagramProfile, InstagramPost } from "@/types/instagram";
import { ProfileStat } from "./profile-stat";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BadgeCheck,
  ExternalLink,
  Film,
  Grid3X3,
  ImageIcon,
  Lock,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Post type icon mapping ────────────────────────────────────────
function PostTypeIcon({ type }: { type: InstagramPost["type"] }) {
  const icons = {
    video: <Film className="h-3 w-3 text-white" />,
    carousel: <Layers className="h-3 w-3 text-white" />,
    image: <ImageIcon className="h-3 w-3 text-white" />,
  };
  return (
    <span className="absolute right-1.5 top-1.5 drop-shadow-md">
      {icons[type]}
    </span>
  );
}

// ─── Individual post thumbnail ─────────────────────────────────────
function PostThumbnail({ post }: { post: InstagramPost }) {
  return (
    <a
      href={post.url ?? "#"}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block aspect-square overflow-hidden rounded-lg bg-muted ring-1 ring-foreground/5 transition-all hover:ring-violet-500/40"
      aria-label={post.caption?.slice(0, 60) ?? "View post"}
    >
      {post.thumbnail_url ? (
        <Image
          src={post.thumbnail_url}
          alt={post.caption?.slice(0, 80) ?? "Instagram post"}
          fill
          sizes="(max-width: 640px) 33vw, 150px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-muted">
          <ImageIcon className="h-6 w-6 text-muted-foreground/30" />
        </div>
      )}

      {/* Post type icon overlay */}
      <PostTypeIcon type={post.type} />

      {/* Hover overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/0 opacity-0 transition-all group-hover:bg-black/50 group-hover:opacity-100">
        <span className="text-xs font-semibold text-white">
          ♥ {post.likes.toLocaleString()}
        </span>
        <span className="text-xs text-white/80">
          💬 {post.comments.toLocaleString()}
        </span>
      </div>
    </a>
  );
}

// ─── Main ProfileCard ──────────────────────────────────────────────
interface ProfileCardProps {
  profile: InstagramProfile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const latestPosts = profile.posts.slice(0, 6);

  return (
    <Card className="w-full overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      {/* Top gradient accent */}
      <div className="h-1 w-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500" />

      <CardHeader className="pt-6">
        {/* Avatar + identity row */}
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-start sm:text-left">
          {/* Profile picture */}
          <div className="relative shrink-0">
            <div className="h-20 w-20 overflow-hidden rounded-full ring-2 ring-violet-500/30 ring-offset-2 ring-offset-card sm:h-24 sm:w-24">
              {profile.profile_picture_url ? (
                <Image
                  src={profile.profile_picture_url}
                  alt={`${profile.username} profile picture`}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-2xl font-bold text-white">
                  {profile.username[0]?.toUpperCase()}
                </div>
              )}
            </div>

            {/* Private lock badge */}
            {profile.is_private && (
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-muted ring-2 ring-card">
                <Lock className="h-3 w-3 text-muted-foreground" />
              </span>
            )}
          </div>

          {/* Name + meta */}
          <div className="flex flex-1 flex-col gap-1">
            {/* Username + verified */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:justify-start">
              <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                @{profile.username}
              </h2>
              {profile.is_verified && (
                <BadgeCheck className="h-5 w-5 shrink-0 text-violet-400" />
              )}
            </div>

            {/* Display name */}
            {profile.display_name && (
              <p className="text-sm font-medium text-muted-foreground">
                {profile.display_name}
              </p>
            )}

            {/* Category badge */}
            {profile.category && (
              <div className="flex justify-center sm:justify-start">
                <Badge
                  variant="secondary"
                  className="w-fit text-xs font-normal text-muted-foreground"
                >
                  {profile.category}
                </Badge>
              </div>
            )}

            {/* External URL */}
            {profile.external_url && (
              <a
                href={profile.external_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-violet-400 transition-colors hover:text-violet-300 sm:justify-start"
              >
                <ExternalLink className="h-3 w-3" />
                {profile.external_url.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-6">
        {/* Bio */}
        {profile.bio && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {profile.bio}
          </p>
        )}

        <Separator className="opacity-40" />

        {/* Stats row */}
        <div
          className={cn(
            "grid grid-cols-3 gap-2",
            "rounded-xl border border-border/40 bg-muted/20 px-4 py-4"
          )}
        >
          <ProfileStat label="Followers" value={profile.follower_count} />
          <div className="flex justify-center">
            <Separator orientation="vertical" className="h-full opacity-40" />
          </div>
          <ProfileStat label="Following" value={profile.following_count} />
        </div>

        {/* Posts count separate card */}
        <div className="flex items-center justify-between rounded-xl border border-border/40 bg-muted/20 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Grid3X3 className="h-4 w-4" />
            Total Posts
          </div>
          <span className="text-sm font-semibold text-foreground">
            {profile.post_count.toLocaleString()}
          </span>
        </div>

        <Separator className="opacity-40" />

        {/* Latest posts grid */}
        {latestPosts.length > 0 && (
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Grid3X3 className="h-4 w-4 text-violet-400" />
              Latest Posts
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {latestPosts.map((post) => (
                <PostThumbnail key={post.id} post={post} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
