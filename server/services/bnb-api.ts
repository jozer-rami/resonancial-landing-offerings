/**
 * BNB (Banco Nacional de Bolivia) API Client
 * Handles authentication, QR code generation, and payment verification
 */

interface BnbAuthResponse {
  token: string;
  expiresIn: number;
}

interface BnbQrRequest {
  currencyCode: number; // 1 = BOB, 2 = USD
  amount: number;
  reference: string;
  serviceCode: string;
  dueDate: string; // YYYY-MM-DD
  installmentsQuantity: number;
  chargeType: number; // 1 = automatic, 2 = manual
  chargeDate?: number; // Day of month for automatic charge
}

interface BnbQrResponse {
  qrId: string;
  qrContent: string; // Base64 encoded QR image
  expiresAt: string; // ISO timestamp
  status?: string;
}

interface BnbQrStatusResponse {
  qrId: string;
  status: "paid" | "pending" | "expired" | "error";
  paidAt?: string; // ISO timestamp
  amount?: number;
  transactionId?: string;
  error?: string;
}

interface TokenCache {
  token: string;
  expiresAt: number;
}

export class BnbApiClient {
  private baseUrl: string;
  private accountId: string;
  private authorizationId: string;
  private tokenCache: TokenCache | null = null;

  constructor() {
    const isSandbox = process.env.BNB_API_SANDBOX === "true";
    this.baseUrl = process.env.BNB_API_BASE_URL || 
      (isSandbox 
        ? "https://sandbox-api.bnb.com.bo" 
        : "https://api.bnb.com.bo");
    
    this.accountId = process.env.BNB_ACCOUNT_ID || "";
    this.authorizationId = process.env.BNB_AUTHORIZATION_ID || "";

    if (!this.accountId || !this.authorizationId) {
      console.warn("BNB API credentials not configured. BNB payment features will not work.");
    }
  }

  /**
   * Get authentication token from BNB API
   * Caches token and refreshes before expiration
   */
  private async getAuthToken(): Promise<string> {
    // Check if cached token is still valid (refresh 5 minutes before expiration)
    if (this.tokenCache && this.tokenCache.expiresAt > Date.now() + 5 * 60 * 1000) {
      return this.tokenCache.token;
    }

    try {
      const response = await fetch(`${this.baseUrl}/ClientAuthentication.API/api/v1/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accountId: this.accountId,
          authorizationId: this.authorizationId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BNB authentication failed: ${response.status} ${errorText}`);
      }

      const data: BnbAuthResponse = await response.json();
      
      // Cache token with expiration
      this.tokenCache = {
        token: data.token,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      };

      return data.token;
    } catch (error) {
      console.error("BNB API authentication error:", error);
      throw new Error(`Failed to authenticate with BNB API: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate a QR code for a fixed amount payment
   */
  async generateQrCode(params: {
    amount: number; // Amount in decimal (e.g., 500.00)
    currency: "BOB" | "USD";
    reference: string;
    serviceCode: string;
    expiresInDays?: number; // Default 7 days
  }): Promise<BnbQrResponse> {
    const token = await this.getAuthToken();

    // Calculate expiration date
    const expiresInDays = params.expiresInDays || 7;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + expiresInDays);
    const dueDateStr = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD

    const requestBody: BnbQrRequest = {
      currencyCode: params.currency === "BOB" ? 1 : 2,
      amount: params.amount,
      reference: params.reference,
      serviceCode: params.serviceCode,
      dueDate: dueDateStr,
      installmentsQuantity: 1,
      chargeType: 1, // Automatic
      chargeDate: 20, // Day of month for automatic charge
    };

    try {
      const response = await fetch(`${this.baseUrl}/Services/GetQRFixedAmount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BNB QR generation failed: ${response.status} ${errorText}`);
      }

      const data: BnbQrResponse = await response.json();
      
      // Convert dueDate to ISO timestamp for expiresAt
      const expiresAt = new Date(dueDate);
      expiresAt.setHours(23, 59, 59, 999);

      return {
        ...data,
        expiresAt: expiresAt.toISOString(),
      };
    } catch (error) {
      console.error("BNB QR generation error:", error);
      throw new Error(`Failed to generate BNB QR code: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check the payment status of a QR code
   */
  async checkQrStatus(qrId: string): Promise<BnbQrStatusResponse> {
    const token = await this.getAuthToken();

    try {
      const response = await fetch(`${this.baseUrl}/main/getQRStatusAsync?qrId=${encodeURIComponent(qrId)}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`BNB QR status check failed: ${response.status} ${errorText}`);
      }

      const data: BnbQrStatusResponse = await response.json();
      return data;
    } catch (error) {
      console.error("BNB QR status check error:", error);
      throw new Error(`Failed to check BNB QR status: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Check if BNB API is configured
   */
  isConfigured(): boolean {
    return !!(this.accountId && this.authorizationId);
  }
}

// Singleton instance
export const bnbApi = new BnbApiClient();
