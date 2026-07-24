import { socialAccounts, publishingPosts } from "@/lib/db/schema";
import { InferSelectModel } from "drizzle-orm";

export type SocialAccount = InferSelectModel<typeof socialAccounts>;
export type PublishingPost = InferSelectModel<typeof publishingPosts>;

export interface PublishingResult {
  success: boolean;
  platformPostId?: string;
  error?: string;
  metrics?: {
    latencyMs: number;
    [key: string]: any;
  };
}

export interface PublishParams {
  post: PublishingPost;
  account: SocialAccount;
  content: string;
  mediaUrls: string[];
}

export interface ValidateAccountParams {
  account: SocialAccount;
}

export interface PublishingConnector {
  platform: string;

  /**
   * Publishes the content to the target social platform.
   */
  publish(params: PublishParams): Promise<PublishingResult>;

  /**
   * Validates if the account token is still valid.
   */
  validateAccount(params: ValidateAccountParams): Promise<boolean>;
}
