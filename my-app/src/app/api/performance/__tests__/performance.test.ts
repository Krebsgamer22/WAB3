import { POST } from '../route'
import { NextRequest } from 'next/server'

async function executeHandler(handler: Function, request: NextRequest) {
  const response = await handler(request)
  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.json()
  }
}

describe('Medal Calculation', () => {
  it('should award Gold for performance above 90%', async () => {
    const request = new NextRequest('http://localhost/api/performance', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=test-boundary' },
      body: `--test-boundary\r
Content-Disposition: form-data; name="score"\r
\r
95\r
--test-boundary\r
Content-Disposition: form-data; name="file"; filename="test.txt"\r
Content-Type: text/plain\r
\r
Test content\r
--test-boundary--`
    })
    
    const response = await executeHandler(POST, request)
    expect(response.status).toBe(200)
    expect(response.body.performances[0].medal).toBe('Gold')
  })

  it('should award Silver for performance between 75-89%', async () => {
    const request = new NextRequest('http://localhost/api/performance', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=test-boundary' },
      body: `--test-boundary\r
Content-Disposition: form-data; name="score"\r
\r
80\r
--test-boundary\r
Content-Disposition: form-data; name="file"; filename="test.txt"\r
Content-Type: text/plain\r
\r
Test content\r
--test-boundary--`
    })
    
    const response = await executeHandler(POST, request)
    expect(response.status).toBe(200)
    expect(response.body.performances[0].medal).toBe('Silver')
  })

  it('should award Bronze for performance between 60-74%', async () => {
    const request = new NextRequest('http://localhost/api/performance', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=test-boundary' },
      body: `--test-boundary\r
Content-Disposition: form-data; name="score"\r
\r
65\r
--test-boundary\r
Content-Disposition: form-data; name="file"; filename="test.txt"\r
Content-Type: text/plain\r
\r
Test content\r
--test-boundary--`
    })
    
    const response = await executeHandler(POST, request)
    expect(response.status).toBe(200)
    expect(response.body.performances[0].medal).toBe('Bronze')
  })

  it('should reject scores below 60%', async () => {
    const request = new NextRequest('http://localhost/api/performance', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=test-boundary' },
      body: `--test-boundary\r
Content-Disposition: form-data; name="score"\r
\r
55\r
--test-boundary\r
Content-Disposition: form-data; name="file"; filename="test.txt"\r
Content-Type: text/plain\r
\r
Test content\r
--test-boundary--`
    })
    
    const response = await executeHandler(POST, request)
    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/minimum threshold/i)
  })
})
