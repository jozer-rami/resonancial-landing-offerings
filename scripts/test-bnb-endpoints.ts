#!/usr/bin/env npx tsx
/**
 * BNB API Endpoint Discovery Script
 *
 * Tests all known BNB sandbox endpoints to discover which ones are active
 * and what request/response formats they expect.
 *
 * Run with: npx tsx scripts/test-bnb-endpoints.ts
 */

import { config as loadEnv } from 'dotenv';
loadEnv();

// ============================================================================
// BNB Sandbox URLs from documentation
// ============================================================================

const SANDBOX_URLS = {
  // Authentication endpoints
  auth: [
    'https://clientauthenticationapiv2.azurewebsites.net/api/v1/auth/token',
    'http://test.bnb.com.bo/ClientAuthentication.API/api/v1/auth/token',
  ],

  // QR Simple endpoints
  qrSimple: [
    'https://qrsimpleapiv2.azurewebsites.net/api/v1/qr',
    'https://qrsimpleapiv2.azurewebsites.net/api/v1/qr/status',
  ],

  // Account endpoints
  account: [
    'https://accountapiv1.azurewebsites.net/api/v1/balance',
    'https://accountapiv1.azurewebsites.net/api/v1/accounts',
  ],

  // Direct Debit endpoints
  directDebit: [
    'http://test.bnb.com.bo/DirectDebit/api/Services/GetQRFixedAmount',
    'http://test.bnb.com.bo/DirectDebit/api/Services/GetQRVariableAmount',
    'http://test.bnb.com.bo/DirectDebit/api/Services/SendDebitOrder',
    'http://test.bnb.com.bo/DirectDebit/api/Services/GetDetail',
  ],

  // General developer endpoints
  general: [
    'http://bnbapideveloperv1.azurewebsites.net/main/getQRWithImageAsync',
    'http://bnbapideveloperv1.azurewebsites.net/main/getQRStatusAsync',
    'http://bnbapideveloperv1.azurewebsites.net/main/getQRbyGenerationDateAsync',
    'http://bnbapideveloperv1.azurewebsites.net/Enterprise/TransferQR',
    'http://bnbapideveloperv1.azurewebsites.net/Enterprise/Balance',
    'http://bnbapideveloperv1.azurewebsites.net/Enterprise/AccountBalances',
    'http://bnbapideveloperv1.azurewebsites.net/Enterprise/BankStatement',
  ],
};

// Sample request bodies from BNB documentation
const SAMPLE_REQUESTS = {
  auth: {
    accountId: 'I8Bl1/IZBWyZk+qJCaMahw==',
    authorizationId: 'xGTy/5MpdpjgSeuBPIEVwA==',
  },

  qrSimple: {
    currency: 'BOB',
    gloss: 'Prueba BOA',
    amount: '20',
    singleUse: 'true',
    expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },

  transferQR: {
    userKey: 'e8k7crKA9S0:APA91bGDZ76NccQkYXIzS5',
    sourceAccountNumber: '1520468087',
    destinationAccountNumber: '1520468060',
    currency: '2003',
    ammount: '10',
    reference: 'TEST',
    onlyUse: 'false',
  },

  balance: {
    userKey: 'e8k7crKA9S0:APA91bGDZ76NccQkYXIzS5',
    accountNumber: '1520468133',
  },

  fixedAmountQR: {
    currencyCode: 1,
    amount: 1000,
    reference: 'Pago de telefonía TIGO',
    serviceCode: 'KH2XI',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    installmentsQuantity: 1,
    chargeType: 1,
    chargeDate: 20,
  },

  qrWithImage: {
    currency: 1,
    amount: 50,
    reference: `IMG-${Date.now()}`,
    expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    singleUse: true,
    description: 'Test QR with image',
  },
};

// ============================================================================
// Utilities
// ============================================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(70));
  log(` ${title}`, 'bright');
  console.log('='.repeat(70));
}

interface EndpointResult {
  url: string;
  method: string;
  status: number | 'ERROR';
  statusText: string;
  responsePreview: string;
  isJson: boolean;
  responseKeys?: string[];
  duration: number;
}

async function testEndpoint(
  url: string,
  method: 'GET' | 'POST',
  body?: object,
  token?: string
): Promise<EndpointResult> {
  const startTime = Date.now();

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();
    let isJson = false;
    let responseKeys: string[] | undefined;

    try {
      const json = JSON.parse(responseText);
      isJson = true;
      responseKeys = Object.keys(json);
    } catch {
      // Not JSON
    }

    return {
      url,
      method,
      status: response.status,
      statusText: response.statusText,
      responsePreview: responseText.substring(0, 300),
      isJson,
      responseKeys,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      url,
      method,
      status: 'ERROR',
      statusText: error instanceof Error ? error.message : String(error),
      responsePreview: '',
      isJson: false,
      duration: Date.now() - startTime,
    };
  }
}

function printResult(result: EndpointResult) {
  const statusColor = result.status === 200 || result.status === 201
    ? 'green'
    : result.status === 'ERROR'
    ? 'red'
    : 'yellow';

  console.log(`\n  ${colors[statusColor]}[${result.status}]${colors.reset} ${result.method} ${result.url}`);
  console.log(`  ${colors.dim}Duration: ${result.duration}ms${colors.reset}`);

  if (result.isJson && result.responseKeys) {
    console.log(`  ${colors.cyan}JSON Response Keys: ${result.responseKeys.join(', ')}${colors.reset}`);
  }

  if (result.responsePreview) {
    const preview = result.responsePreview.length > 150
      ? result.responsePreview.substring(0, 150) + '...'
      : result.responsePreview;
    console.log(`  ${colors.dim}Response: ${preview}${colors.reset}`);
  }
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(70));
  log(' BNB API ENDPOINT DISCOVERY', 'bright');
  log(' Testing all known sandbox endpoints', 'dim');
  console.log('='.repeat(70));

  const results: EndpointResult[] = [];

  // Test Authentication Endpoints
  logSection('1. AUTHENTICATION ENDPOINTS');
  for (const url of SANDBOX_URLS.auth) {
    const result = await testEndpoint(url, 'POST', SAMPLE_REQUESTS.auth);
    results.push(result);
    printResult(result);
  }

  // Test QR Simple Endpoints
  logSection('2. QR SIMPLE API ENDPOINTS');
  for (const url of SANDBOX_URLS.qrSimple) {
    const method = url.includes('status') ? 'GET' : 'POST';
    const body = method === 'POST' ? SAMPLE_REQUESTS.qrSimple : undefined;
    const result = await testEndpoint(url, method, body);
    results.push(result);
    printResult(result);
  }

  // Test Account Endpoints
  logSection('3. ACCOUNT API ENDPOINTS');
  for (const url of SANDBOX_URLS.account) {
    const result = await testEndpoint(url, 'GET');
    results.push(result);
    printResult(result);
  }

  // Test Direct Debit Endpoints
  logSection('4. DIRECT DEBIT API ENDPOINTS');
  for (const url of SANDBOX_URLS.directDebit) {
    let body: object | undefined;
    if (url.includes('GetQRFixedAmount') || url.includes('GetQRVariableAmount')) {
      body = SAMPLE_REQUESTS.fixedAmountQR;
    }
    const result = await testEndpoint(url, 'POST', body);
    results.push(result);
    printResult(result);
  }

  // Test General Developer Endpoints
  logSection('5. GENERAL DEVELOPER API ENDPOINTS');
  for (const url of SANDBOX_URLS.general) {
    let method: 'GET' | 'POST' = 'POST';
    let body: object | undefined;

    if (url.includes('getQRStatusAsync') || url.includes('getQRbyGenerationDateAsync') ||
        url.includes('Balance') || url.includes('AccountBalances') || url.includes('BankStatement')) {
      method = 'GET';
    } else if (url.includes('TransferQR')) {
      body = SAMPLE_REQUESTS.transferQR;
    } else if (url.includes('getQRWithImageAsync')) {
      body = SAMPLE_REQUESTS.qrWithImage;
    }

    const result = await testEndpoint(url, method, body);
    results.push(result);
    printResult(result);
  }

  // Summary
  logSection('SUMMARY');

  const working = results.filter(r => r.status === 200 || r.status === 201);
  const authRequired = results.filter(r => r.status === 401);
  const serverError = results.filter(r => r.status === 500);
  const notFound = results.filter(r => r.status === 404);
  const networkError = results.filter(r => r.status === 'ERROR');
  const other = results.filter(r =>
    ![200, 201, 401, 500, 404, 'ERROR'].includes(r.status)
  );

  console.log('\n');
  log(`  Total endpoints tested: ${results.length}`, 'bright');
  console.log();

  if (working.length > 0) {
    log(`  Working (200/201): ${working.length}`, 'green');
    working.forEach(r => console.log(`    - ${r.url}`));
  }

  if (authRequired.length > 0) {
    log(`  Auth Required (401): ${authRequired.length}`, 'yellow');
    authRequired.forEach(r => console.log(`    - ${r.url}`));
  }

  if (serverError.length > 0) {
    log(`  Server Error (500): ${serverError.length}`, 'red');
    serverError.forEach(r => console.log(`    - ${r.url}`));
  }

  if (notFound.length > 0) {
    log(`  Not Found (404): ${notFound.length}`, 'yellow');
    notFound.forEach(r => console.log(`    - ${r.url}`));
  }

  if (networkError.length > 0) {
    log(`  Network Error: ${networkError.length}`, 'red');
    networkError.forEach(r => console.log(`    - ${r.url}: ${r.statusText}`));
  }

  if (other.length > 0) {
    log(`  Other Status: ${other.length}`, 'yellow');
    other.forEach(r => console.log(`    - [${r.status}] ${r.url}`));
  }

  // Recommendations
  logSection('RECOMMENDATIONS');

  if (working.length > 0) {
    log('\nWorking endpoints can be used for testing.', 'green');
  }

  log('\nTo proceed with BNB integration:', 'cyan');
  log('  1. Contact BNB Open Banking to request sandbox credentials', 'cyan');
  log('     - Portal: https://www.bnb.com.bo/PortalBNB/Api/OpenBanking', 'dim');
  log('  2. Once you have credentials, add them to .env:', 'cyan');
  log('     BNB_ACCOUNT_ID=your_account_id', 'dim');
  log('     BNB_AUTHORIZATION_ID=your_authorization_id', 'dim');
  log('     BNB_API_SANDBOX=true', 'dim');
  log('  3. Run the full test suite: npx tsx scripts/test-bnb-api.ts', 'cyan');
}

// Run
main().catch(error => {
  console.error('\nUnexpected error:', error);
  process.exit(1);
});
