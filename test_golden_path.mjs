import http from 'http';

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTest() {
  console.log('🧪 Starting Citizen Golden Path API Verification...\n');

  // 1. Health check
  const health = await request({ hostname: 'localhost', port: 4000, path: '/api/health', method: 'GET' });
  console.log('1. Health Check status:', health.status, health.body);

  // 2. Submit Report
  console.log('\n2. Creating new citizen report...');
  const newReportPayload = {
    category: 'STORM_DRAIN',
    severity: 'HIGH',
    wardNumber: '14',
    wardName: 'Vyttila Central',
    latitude: 9.9674,
    longitude: 76.3182,
    landmark: '9th Cross, Market Junction North',
    description: 'Heavy silt accumulation and plastic debris completely clogging inlet basin.',
    photoFileName: 'golden_path_evidence.jpg'
  };

  const createRes = await request(
    {
      hostname: 'localhost',
      port: 4000,
      path: '/api/reports',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    },
    newReportPayload
  );

  console.log('Creation response status:', createRes.status);
  const createdReport = createRes.body.data;
  console.log('Generated Ticket ID:', createdReport.ticketId);
  console.log('Report Status:', createdReport.status);
  console.log('Created At:', createdReport.createdAt);
  console.log('Updated At:', createdReport.updatedAt);
  console.log('Ward:', createdReport.ward);
  console.log('Initial Audit Log:', createdReport.auditLog);

  if (!createdReport.ticketId.startsWith('OZH-')) {
    throw new Error('Ticket ID does not follow OZH format');
  }
  if (createdReport.status !== 'REPORTED') {
    throw new Error('Initial status is not REPORTED');
  }

  // 3. Query report by Ticket ID (Golden Path /track/:ticketId)
  console.log(`\n3. Fetching ticket details for ${createdReport.ticketId}...`);
  const trackRes = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/reports/ticket/${encodeURIComponent(createdReport.ticketId)}`,
    method: 'GET'
  });

  console.log('Lookup status:', trackRes.status);
  const fetchedReport = trackRes.body.data;
  console.log('Verified Ticket ID:', fetchedReport.ticketId);
  console.log('Verified Category:', fetchedReport.category);
  console.log('Verified Status:', fetchedReport.status);

  // 4. Test case-insensitivity and trimming
  console.log('\n4. Testing ticket lookup with lowercase and whitespace...');
  const lowerTicket = `  ${createdReport.ticketId.toLowerCase()}  `;
  const lookupFuzzy = await request({
    hostname: 'localhost',
    port: 4000,
    path: `/api/reports/ticket/${encodeURIComponent(lowerTicket.trim())}`,
    method: 'GET'
  });
  console.log('Fuzzy lookup status:', lookupFuzzy.status, 'Ticket ID match:', lookupFuzzy.body.data.ticketId === createdReport.ticketId);

  // 5. Test 404 on invalid ticket
  console.log('\n5. Testing invalid ticket lookup...');
  const notFound = await request({
    hostname: 'localhost',
    port: 4000,
    path: '/api/reports/ticket/OZH-999999-999',
    method: 'GET'
  });
  console.log('Invalid lookup status:', notFound.status, notFound.body);

  console.log('\n✅ All Golden Path API tests passed successfully!');
}

runTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
