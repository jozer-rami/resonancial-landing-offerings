#!/usr/bin/env npx tsx
/**
 * BNB API Sandbox Test Script
 *
 * Tests the BNB Open Banking API integration for QR payments.
 * Run with: npx tsx scripts/test-bnb-api.ts
 *
 * Uses sandbox test credentials by default from BNB documentation.
 * Override with environment variables if needed.
 */

// Load environment variables from .env file if it exists
import { config as loadEnv } from 'dotenv';
loadEnv();

// ============================================================================
// Configuration - BNB Sandbox URLs & Credentials
// ============================================================================

// BNB Sandbox URLs (from official documentation)
const SANDBOX_URLS = {
  auth: 'https://clientauthenticationapiv2.azurewebsites.net',
  authAlt: 'http://test.bnb.com.bo/ClientAuthentication.API',
  qrSimple: 'https://qrsimpleapiv2.azurewebsites.net',
  account: 'https://accountapiv1.azurewebsites.net',
  directDebit: 'http://test.bnb.com.bo/DirectDebit/api',
  general: 'http://bnbapideveloperv1.azurewebsites.net',
};

// Test credentials from BNB sandbox documentation
const SANDBOX_CREDENTIALS = {
  primary: {
    accountId: 'I8Bl1/IZBWyZk+qJCaMahw==',
    authorizationId: 'xGTy/5MpdpjgSeuBPIEVwA==',
  },
  alternative: {
    accountId: 's9CG8FE7Id75ef2jeX9bUA==',
    authorizationId: '713K7PvTlACs1gdmv9jGgA==',
  },
};

// Use environment variables if provided, otherwise fall back to sandbox credentials
// Try alternative credentials since primary may have expired
const config = {
  accountId: process.env.BNB_ACCOUNT_ID || SANDBOX_CREDENTIALS.alternative.accountId,
  authorizationId: process.env.BNB_AUTHORIZATION_ID || SANDBOX_CREDENTIALS.alternative.authorizationId,
  isSandbox: process.env.BNB_API_SANDBOX !== 'false',  // Default to sandbox
  urls: SANDBOX_URLS,
  // For custom base URL override
  customBaseUrl: process.env.BNB_API_BASE_URL,
};

// ============================================================================
// Types
// ============================================================================

interface BnbAuthResponse {
  token: string;
  expiresIn: number;
  tokenType?: string;
  error?: string;
  message?: string;
}

interface BnbQrResponse {
  qrId?: string;
  qrImage?: string;
  qrContent?: string;
  expirationDate?: string;
  status?: string;
  message?: string;
  success?: boolean;
  error?: string;
}

interface BnbQrStatusResponse {
  qrId?: string;
  status?: string;
  paidAt?: string;
  amount?: number;
  transactionId?: string;
  error?: string;
  message?: string;
}

interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  data?: unknown;
  error?: string;
  rawResponse?: string;
}

// ============================================================================
// Utilities
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(60));
  log(` ${title}`, 'bright');
  console.log('='.repeat(60));
}

function logResult(result: TestResult) {
  const status = result.success
    ? `${colors.green}PASS${colors.reset}`
    : `${colors.red}FAIL${colors.reset}`;

  console.log(`\n[${status}] ${result.name} (${result.duration}ms)`);

  if (result.error) {
    log(`  Error: ${result.error}`, 'red');
  }

  if (result.rawResponse && !result.success) {
    log(`  Raw Response: ${result.rawResponse.substring(0, 200)}...`, 'dim');
  }

  if (result.data && result.success) {
    console.log('  Response:', JSON.stringify(result.data, null, 2).split('\n').map(l => '    ' + l).join('\n'));
  }
}

async function runTest<T>(
  name: string,
  fn: () => Promise<T>
): Promise<TestResult & { data?: T }> {
  const startTime = Date.now();

  try {
    const data = await fn();
    return {
      name,
      success: true,
      duration: Date.now() - startTime,
      data,
    };
  } catch (error) {
    return {
      name,
      success: false,
      duration: Date.now() - startTime,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

// ============================================================================
// API Functions
// ============================================================================

let cachedToken: string | null = null;

/**
 * Test 1: Authentication - Try multiple endpoints
 */
async function testAuthentication(): Promise<BnbAuthResponse> {
  const authUrls = [
    `${config.urls.auth}/api/v1/auth/token`,
    `${config.urls.authAlt}/api/v1/auth/token`,
  ];

  const requestBody = {
    accountId: config.accountId,
    authorizationId: config.authorizationId,
  };

  log('\nTrying authentication endpoints...', 'cyan');
  log(`  Account ID: ${config.accountId.substring(0, 12)}...`, 'cyan');

  for (const authUrl of authUrls) {
    log(`\n  Trying: ${authUrl}`, 'cyan');

    try {
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const responseText = await response.text();
      log(`  Status: ${response.status}`, response.ok ? 'green' : 'yellow');

      // Log response for debugging
      log(`  Response preview: ${responseText.substring(0, 200)}`, 'dim');

      if (response.ok) {
        try {
          const data = JSON.parse(responseText);
          log(`  Parsed response keys: ${Object.keys(data).join(', ')}`, 'dim');

          // Try different token field names
          const token = data.token || data.access_token || data.accessToken || data.Token;
          if (token) {
            cachedToken = token;
            log(`  Token received!`, 'green');
            return {
              token: token.substring(0, 20) + '...',
              expiresIn: data.expiresIn || data.expires_in || 3600,
              tokenType: data.tokenType || data.token_type,
            };
          } else {
            log(`  No token field found. Full response: ${JSON.stringify(data)}`, 'yellow');
          }
        } catch (parseError) {
          log(`  Response is not JSON: ${responseText.substring(0, 100)}`, 'yellow');
        }
      } else {
        log(`  Error Response: ${responseText.substring(0, 250)}`, 'dim');
      }
    } catch (error) {
      log(`  Network error: ${error instanceof Error ? error.message : String(error)}`, 'yellow');
    }
  }

  throw new Error('Authentication failed on all endpoints');
}

/**
 * Test 2: Generate QR Code (QR Simple API)
 */
async function testGenerateQrSimple(): Promise<BnbQrResponse> {
  if (!cachedToken) {
    throw new Error('No auth token available. Run authentication test first.');
  }

  const reference = `TEST-${Date.now()}`;
  const amount = 20;  // Test amount in BOB
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 1);

  const qrUrl = `${config.urls.qrSimple}/api/v1/qr`;

  log('\nGenerating simple QR code...', 'cyan');
  log(`  URL: ${qrUrl}`, 'cyan');
  log(`  Amount: ${amount} BOB`, 'cyan');
  log(`  Reference: ${reference}`, 'cyan');

  const requestBody = {
    currency: 'BOB',
    gloss: reference,
    amount: amount.toString(),
    singleUse: 'true',
    expirationDate: expirationDate.toISOString().split('T')[0],
  };

  log(`  Request Body: ${JSON.stringify(requestBody)}`, 'dim');

  const response = await fetch(qrUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${cachedToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  log(`  Status: ${response.status}`, response.ok ? 'green' : 'red');

  if (!response.ok) {
    throw new Error(`QR generation failed: ${response.status} - ${responseText}`);
  }

  let data: BnbQrResponse;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  return {
    qrId: data.qrId,
    qrImage: data.qrImage ? `${data.qrImage.substring(0, 50)}... (${data.qrImage.length} chars)` : undefined,
    qrContent: data.qrContent,
    expirationDate: data.expirationDate,
    status: data.status,
    success: data.success,
  };
}

/**
 * Test 3: Generate QR Code (Direct Debit - Fixed Amount)
 */
async function testGenerateQrFixedAmount(): Promise<BnbQrResponse> {
  if (!cachedToken) {
    throw new Error('No auth token available. Run authentication test first.');
  }

  const reference = `RES-${Date.now()}`;
  const amount = 100;
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const qrUrl = `${config.urls.directDebit}/Services/GetQRFixedAmount`;

  log('\nGenerating fixed amount QR code (Direct Debit)...', 'cyan');
  log(`  URL: ${qrUrl}`, 'cyan');
  log(`  Amount: ${amount} BOB`, 'cyan');
  log(`  Reference: ${reference}`, 'cyan');

  const requestBody = {
    currencyCode: 1,  // BOB
    amount: amount,
    reference: reference,
    serviceCode: 'RESONANCIAL',
    dueDate: dueDate.toISOString().split('T')[0],
    installmentsQuantity: 1,
    chargeType: 1,
    chargeDate: 20,
  };

  log(`  Request Body: ${JSON.stringify(requestBody)}`, 'dim');

  const response = await fetch(qrUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${cachedToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  log(`  Status: ${response.status}`, response.ok ? 'green' : 'red');

  if (!response.ok) {
    throw new Error(`QR generation failed: ${response.status} - ${responseText}`);
  }

  let data: BnbQrResponse;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  return {
    qrId: data.qrId,
    qrImage: data.qrImage ? `${data.qrImage.substring(0, 50)}... (${data.qrImage.length} chars)` : undefined,
    qrContent: data.qrContent,
    expirationDate: data.expirationDate,
    status: data.status,
    success: data.success,
    message: data.message,
  };
}

/**
 * Test 4: Generate QR with Image (General API)
 */
async function testGenerateQrWithImage(): Promise<BnbQrResponse> {
  if (!cachedToken) {
    throw new Error('No auth token available. Run authentication test first.');
  }

  const reference = `IMG-${Date.now()}`;
  const amount = 50;
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + 1);

  const qrUrl = `${config.urls.general}/main/getQRWithImageAsync`;

  log('\nGenerating QR code with image...', 'cyan');
  log(`  URL: ${qrUrl}`, 'cyan');
  log(`  Amount: ${amount} BOB`, 'cyan');
  log(`  Reference: ${reference}`, 'cyan');

  const requestBody = {
    currency: 1,  // BOB
    amount: amount,
    reference: reference,
    expirationDate: expirationDate.toISOString().split('T')[0],
    singleUse: true,
    description: 'Test QR with image - Resonancial',
  };

  log(`  Request Body: ${JSON.stringify(requestBody)}`, 'dim');

  const response = await fetch(qrUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${cachedToken}`,
    },
    body: JSON.stringify(requestBody),
  });

  const responseText = await response.text();
  log(`  Status: ${response.status}`, response.ok ? 'green' : 'red');

  if (!response.ok) {
    throw new Error(`QR with image generation failed: ${response.status} - ${responseText}`);
  }

  let data: BnbQrResponse;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  return {
    qrId: data.qrId,
    qrImage: data.qrImage ? `${data.qrImage.substring(0, 50)}... (${data.qrImage.length} chars)` : undefined,
    qrContent: data.qrContent,
    expirationDate: data.expirationDate,
    status: data.status,
    success: data.success,
  };
}

/**
 * Test 5: Check QR Status
 */
async function testCheckQrStatus(qrId: string): Promise<BnbQrStatusResponse> {
  if (!cachedToken) {
    throw new Error('No auth token available. Run authentication test first.');
  }

  const statusUrl = `${config.urls.general}/main/getQRStatusAsync`;

  log('\nChecking QR status...', 'cyan');
  log(`  URL: ${statusUrl}?qrId=${qrId}`, 'cyan');
  log(`  QR ID: ${qrId}`, 'cyan');

  const response = await fetch(`${statusUrl}?qrId=${encodeURIComponent(qrId)}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${cachedToken}`,
    },
  });

  const responseText = await response.text();
  log(`  Status: ${response.status}`, response.ok ? 'green' : 'red');

  if (!response.ok) {
    throw new Error(`QR status check failed: ${response.status} - ${responseText}`);
  }

  let data: BnbQrStatusResponse;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }

  return data;
}

/**
 * Test 6: Get Account Balance
 */
async function testGetBalance(): Promise<unknown> {
  if (!cachedToken) {
    throw new Error('No auth token available. Run authentication test first.');
  }

  const balanceUrl = `${config.urls.account}/api/v1/balance`;

  log('\nGetting account balance...', 'cyan');
  log(`  URL: ${balanceUrl}`, 'cyan');

  const response = await fetch(balanceUrl, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${cachedToken}`,
    },
  });

  const responseText = await response.text();
  log(`  Status: ${response.status}`, response.ok ? 'green' : 'red');

  if (!response.ok) {
    throw new Error(`Balance check failed: ${response.status} - ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }
}

/**
 * Test 7: List QRs by Date
 */
async function testListQrsByDate(): Promise<unknown> {
  if (!cachedToken) {
    throw new Error('No auth token available. Run authentication test first.');
  }

  const today = new Date().toISOString().split('T')[0];
  const listUrl = `${config.urls.general}/main/getQRbyGenerationDateAsync`;

  log('\nListing QRs by date...', 'cyan');
  log(`  URL: ${listUrl}?date=${today}`, 'cyan');
  log(`  Date: ${today}`, 'cyan');

  const response = await fetch(`${listUrl}?date=${today}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Bearer ${cachedToken}`,
    },
  });

  const responseText = await response.text();
  log(`  Status: ${response.status}`, response.ok ? 'green' : 'red');

  if (!response.ok) {
    throw new Error(`List QRs failed: ${response.status} - ${responseText}`);
  }

  try {
    return JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(60));
  log(' BNB API SANDBOX TEST SUITE', 'bright');
  console.log('='.repeat(60));

  // Check configuration
  logSection('Configuration');
  log(`Using Sandbox Credentials: ${!process.env.BNB_ACCOUNT_ID ? 'Yes (default)' : 'No (custom)'}`, 'cyan');
  log(`\nSandbox URLs:`, 'cyan');
  log(`  Auth:        ${config.urls.auth}`, 'dim');
  log(`  QR Simple:   ${config.urls.qrSimple}`, 'dim');
  log(`  Account:     ${config.urls.account}`, 'dim');
  log(`  Direct Debit: ${config.urls.directDebit}`, 'dim');
  log(`  General:     ${config.urls.general}`, 'dim');
  log(`\nCredentials:`, 'cyan');
  log(`  Account ID: ${config.accountId.substring(0, 12)}...`, 'green');
  log(`  Authorization ID: ${config.authorizationId.substring(0, 12)}...`, 'green');

  const results: TestResult[] = [];
  let lastQrId: string | null = null;

  // Test 1: Authentication
  logSection('Test 1: Authentication');
  const authResult = await runTest('BNB Authentication', testAuthentication);
  results.push(authResult);
  logResult(authResult);

  if (!authResult.success) {
    log('\nAuthentication failed. Cannot proceed with other tests.', 'red');
    log('\nPossible causes:', 'yellow');
    log('  - Sandbox credentials may have expired', 'yellow');
    log('  - Network/firewall blocking requests', 'yellow');
    log('  - BNB sandbox servers may be down', 'yellow');
    printSummary(results);
    process.exit(1);
  }

  // Test 2: Simple QR Generation (QR Simple API)
  logSection('Test 2: QR Simple API');
  const simpleQrResult = await runTest('Generate Simple QR', testGenerateQrSimple);
  results.push(simpleQrResult);
  logResult(simpleQrResult);
  if (simpleQrResult.success && simpleQrResult.data?.qrId) {
    lastQrId = simpleQrResult.data.qrId;
  }

  // Test 3: Fixed Amount QR Generation (Direct Debit)
  logSection('Test 3: Direct Debit - Fixed Amount QR');
  const fixedQrResult = await runTest('Generate Fixed Amount QR', testGenerateQrFixedAmount);
  results.push(fixedQrResult);
  logResult(fixedQrResult);
  if (fixedQrResult.success && fixedQrResult.data?.qrId) {
    lastQrId = fixedQrResult.data.qrId;
  }

  // Test 4: QR with Image (General API)
  logSection('Test 4: General API - QR with Image');
  const imageQrResult = await runTest('Generate QR with Image', testGenerateQrWithImage);
  results.push(imageQrResult);
  logResult(imageQrResult);
  if (imageQrResult.success && imageQrResult.data?.qrId) {
    lastQrId = imageQrResult.data.qrId;
  }

  // Test 5: Check QR Status (if we have a QR ID)
  if (lastQrId) {
    logSection('Test 5: Check QR Status');
    const statusResult = await runTest('Check QR Status', () => testCheckQrStatus(lastQrId!));
    results.push(statusResult);
    logResult(statusResult);
  } else {
    log('\nSkipping QR status check - no QR ID available from previous tests', 'yellow');
  }

  // Test 6: Get Balance
  logSection('Test 6: Account Balance');
  const balanceResult = await runTest('Get Account Balance', testGetBalance);
  results.push(balanceResult);
  logResult(balanceResult);

  // Test 7: List QRs by Date
  logSection('Test 7: List QRs by Date');
  const listResult = await runTest('List QRs by Date', testListQrsByDate);
  results.push(listResult);
  logResult(listResult);

  // Print summary
  printSummary(results);
}

function printSummary(results: TestResult[]) {
  logSection('TEST SUMMARY');

  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const total = results.length;

  console.log('\n');
  results.forEach(r => {
    const status = r.success ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    console.log(`  [${status}] ${r.name}`);
  });

  console.log('\n' + '-'.repeat(40));
  log(`  Total: ${total}`, 'bright');
  log(`  Passed: ${passed}`, passed > 0 ? 'green' : 'reset');
  log(`  Failed: ${failed}`, failed > 0 ? 'red' : 'reset');
  console.log('-'.repeat(40) + '\n');

  if (failed > 0 && passed > 0) {
    log('Partial success! Some endpoints may not be available in sandbox.', 'yellow');
    log('This is normal - not all endpoints may be enabled for testing.', 'yellow');
  } else if (failed === total) {
    log('All tests failed. Check the errors above for details.', 'red');
    log('\nCommon issues:', 'yellow');
    log('  1. Sandbox credentials expired - contact BNB for new ones', 'yellow');
    log('  2. Network issues - check firewall/proxy settings', 'yellow');
    log('  3. API endpoints changed - verify BNB documentation', 'yellow');
  } else {
    log('All tests passed! BNB API integration is working correctly.', 'green');
  }

  log('\nNext steps:', 'cyan');
  log('  1. Review which endpoints work for your use case', 'cyan');
  log('  2. Contact BNB to get production credentials', 'cyan');
  log('  3. Update server/services/bnb-api.ts with working endpoints', 'cyan');
}

// Run tests
main().catch(error => {
  console.error('\nUnexpected error:', error);
  process.exit(1);
});
