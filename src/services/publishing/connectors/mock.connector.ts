import { PublishingConnector, PublishingResult, PublishParams, ValidateAccountParams } from "./connector.interface";
import { connectorRegistry } from "./registry";

export class MockConnector implements PublishingConnector {
  public platform = "mock";

  async publish(params: PublishParams): Promise<PublishingResult> {
    const start = Date.now();
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const latencyMs = Date.now() - start;

    // Simulate failure condition based on some keyword in content (for testing)
    if (params.content.toLowerCase().includes("mock_fail")) {
      return {
        success: false,
        error: "Mock failure triggered by keyword",
        metrics: { latencyMs },
      };
    }

    return {
      success: true,
      platformPostId: `mock_post_${Date.now()}`,
      metrics: { latencyMs },
    };
  }

  async validateAccount(params: ValidateAccountParams): Promise<boolean> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 200));

    // Simulate expired token based on token value
    if (params.account.encryptedAccessToken === "mock_expired_token") {
      return false;
    }

    return true;
  }
}

