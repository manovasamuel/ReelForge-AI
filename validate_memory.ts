import { MemoryService } from "./src/services/memory/memory.service";
import { CompressionEngine } from "./src/services/memory/compression.engine";
import { ExtractionPipeline } from "./src/services/memory/extraction.pipeline";
import { ContextBudgetManager } from "./src/services/ai/context.budget";
import { db } from "./src/lib/db";
import { conversations, messages, longTermMemories } from "./src/lib/db/schema";
import { sql } from "drizzle-orm";

async function runValidation() {
  console.log("=== PHASE 5 VALIDATION SCRIPT ===\n");
  try {
    const userId = "00000000-0000-0000-0000-000000000000";

    console.log("1. Creating test conversation...");
    const conv = await MemoryService.createConversation(userId, "test-workspace-id", "Test Validation");
    console.log(`Created Conversation: ${conv.id}`);

    console.log("\n2. Storing uncompressed messages (testing background triggers)...");
    for (let i = 0; i < 5; i++) {
        await MemoryService.storeMessage(conv.id, "user", `This is a test message ${i} about my brand identity being minimalistic.`);
        await MemoryService.storeMessage(conv.id, "assistant", `Understood. Your brand is minimalistic.`);
    }
    console.log("Messages stored.");

    // Note: setTimeout triggers from storeMessage might run here.
    
    console.log("\n3. Testing Context Budget Manager...");
    const budgetResult = ContextBudgetManager.optimizeContext({
        systemPrompt: "You are a helpful AI.",
        summary: "Previous summary text.",
        memories: ["I like blue colors."],
        recentMessages: [
            { role: "user", content: "Too many messages to fit." },
            { role: "assistant", content: "Indeed." }
        ],
        maxContextTokens: 50 // artificially low budget to force a breach
    });
    console.log("Budget Result:", {
        estimatedTokens: budgetResult.estimatedTokens,
        budgetBreached: budgetResult.budgetBreached,
        removedCount: budgetResult.removedMessages.length
    });

    console.log("\n4. Triggering Extraction Pipeline directly...");
    await ExtractionPipeline.evaluateAndExtract(conv.id, userId);
    console.log("Extraction triggered.");

    console.log("\n5. Validating Retrieval and Provenance...");
    // Let's add a long term memory manually to test retrieval
    await db!.insert(longTermMemories).values({
        userId,
        scope: "user",
        memoryType: "Preference",
        content: "I always prefer dark mode.",
        embedding: new Array(768).fill(0.1), // Dummy vector
        importance: 8,
        accessCount: 1
    });

    const results = await MemoryService.retrieveContext("competitors and market positioning", { workspaceId: "test-workspace-id", userId });
    console.log(`Retrieved ${results.length} memories.`);
    if (results.length > 0) {
        console.log("Top Result Provenance:", results[0].provenance);
    }

    console.log("\nValidation Complete. Cleaning up...");
    
    // Cleanup
    await db!.delete(conversations).where(sql`${conversations.id} = ${conv.id}`);
    await db!.delete(longTermMemories).where(sql`${longTermMemories.userId} = ${userId}`);

    console.log("Cleanup successful.");

  } catch(e) {
    console.error("Validation failed:", e);
  } finally {
      process.exit(0);
  }
}

runValidation();
