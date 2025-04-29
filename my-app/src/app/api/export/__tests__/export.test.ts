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

describe('CSV Export Validation', () => {
  it('should reject invalid TT.MM.JJJJ date format', async () => {
    const request = new NextRequest('http://localhost/api/export', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        athleteIds: [1],
        date: '32.13.2025',
        emails: ['test@example.com']
      })
    })
    
    const response = await executeHandler(POST, request)
    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/date format/i)
  })

  it('should detect duplicate emails', async () => {
    const request = new NextRequest('http://localhost/api/export', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        athleteIds: [1],
        date: '01.01.2025',
        emails: ['dupe@example.com', 'dupe@example.com']
      })
    })
    
    const response = await executeHandler(POST, request)
    expect(response.status).toBe(400)
    expect(response.body.error).toMatch(/unique emails/i)
  })

  it('should accept valid data', async () => {
    const request = new NextRequest('http://localhost/api/export', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        athleteIds: [1, 2],
        date: '31.12.2025',
        emails: ['test1@example.com', 'test2@example.com']
      })
    })
    
    const response = await executeHandler(POST, request)
    expect(response.status).toBe(200)
  })
})
