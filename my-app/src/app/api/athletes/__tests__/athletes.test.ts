import { POST, GET, PUT, DELETE } from '../route'
import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

async function executeHandler(handler: Function, request: NextRequest) {
  const response = await handler(request)
  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: await response.json()
  }
}

describe('Athletes API', () => {
  let testAthleteId: string

  beforeAll(async () => {
    // Create test athlete
    const request = new NextRequest('http://localhost/api/athletes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Athlete',
        email: 'test@example.com',
        birthdate: '2000-01-01',
        gender: 'MALE'
      })
    })
    
    const response = await executeHandler(POST, request)
    testAthleteId = response.body.id
  })

  afterAll(async () => {
    // Cleanup test athlete
    const request = new NextRequest(`http://localhost/api/athletes/${testAthleteId}`, {
      method: 'DELETE'
    })
    await executeHandler(DELETE, request)
  })

  it('should create an athlete (POST)', async () => {
    const request = new NextRequest('http://localhost/api/athletes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'New',
        lastName: 'Athlete',
        email: 'new@example.com',
        birthdate: '1999-05-15',
        gender: 'FEMALE'
      })
    })
    
    const response = await executeHandler(POST, request)
    expect(response.status).toBe(201)
    expect(response.body).toHaveProperty('id')
  })

  it('should get all athletes (GET)', async () => {
    const request = new NextRequest('http://localhost/api/athletes')
    const response = await executeHandler(GET, request)
    
    expect(response.status).toBe(200)
    expect(Array.isArray(response.body)).toBe(true)
    expect(response.body.some((a: any) => a.id === testAthleteId)).toBe(true)
  })

  it('should update an athlete (PUT)', async () => {
    const request = new NextRequest(`http://localhost/api/athletes/${testAthleteId}`, {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ firstName: 'Updated', lastName: 'Name' })
    })
    
    const response = await executeHandler(PUT, request)
    expect(response.status).toBe(200)
    expect(response.body.firstName).toBe('Updated')
    expect(response.body.lastName).toBe('Name')
  })

  it('should delete an athlete (DELETE)', async () => {
    const request = new NextRequest(`http://localhost/api/athletes/${testAthleteId}`, {
      method: 'DELETE'
    })
    
    const response = await executeHandler(DELETE, request)
    expect(response.status).toBe(204)
  })
})
