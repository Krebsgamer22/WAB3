import { POST, GET, PUT, DELETE } from '../route'
import { NextRequest, NextResponse } from 'next/server'
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import prisma from '../../../../lib/prisma'
import { Discipline } from '@prisma/client'

async function executeHandler(handler: Function, request: NextRequest) {
  const response = await handler(request)
  return {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
    body: response.status === 204 ? null : await response.json()
  }
}

describe('Athletes API', () => {
  let testAthleteId: string

  beforeAll(async () => {
    // Cleanup any existing test data
    await prisma.performance.deleteMany({});
    await prisma.athlete.deleteMany({});
    await prisma.medalCriteria.deleteMany({});

    // Create required medal criteria
    await prisma.medalCriteria.create({
      data: {
        discipline: Discipline.TECHNIK,
        minAge: 15,
        maxAge: 30,
        bronzeValue: 50.0,
        silverValue: 60.0,
        goldValue: 70.0
      }
    });

    // Create test athlete
    const uniqueEmail = `test-${Date.now()}@example.com`;
    const request = new NextRequest('http://localhost/api/athletes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'Athlete',
        email: uniqueEmail,
        birthdate: '2000-01-01',
        gender: 'MALE'
      })
    })
    
    const response = await executeHandler(POST, request)
    testAthleteId = response.body.id
  })

  afterAll(async () => {
    // Cleanup any remaining test data
    await prisma.performance.deleteMany({});
    await prisma.athlete.deleteMany({});
    await prisma.medalCriteria.deleteMany({});
  })

  it('should create an athlete (POST)', async () => {
    const request = new NextRequest('http://localhost/api/athletes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'New',
        lastName: 'Athlete',
        email: `new-${Date.now()}@example.com`,
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

  it('should block deletion of athlete with performances', async () => {
    // Create test performance
    await prisma.performance.create({
      data: {
        athlete: { connect: { id: parseInt(testAthleteId) }},
        date: new Date('2025-01-01'),
        value: 52.48,
        criteria: { connect: { discipline: Discipline.TECHNIK }}
      }
    })

    const request = new NextRequest(`http://localhost/api/athletes/${testAthleteId}`, {
      method: 'DELETE'
    })
    
    const response = await executeHandler(DELETE, request)
    expect(response.status).toBe(409)
    expect(response.body.error).toBe('Cannot delete athlete with existing performances')
  })

  it('should delete an athlete (DELETE)', async () => {
    // Create new athlete just for this test
    const uniqueEmail = `delete-test-${Date.now()}@example.com`;
    const createRequest = new NextRequest('http://localhost/api/athletes', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Delete',
        lastName: 'Test',
        email: uniqueEmail,
        birthdate: '2000-01-01',
        gender: 'MALE'
      })
    })
    
    const createResponse = await executeHandler(POST, createRequest)
    const deleteAthleteId = createResponse.body.id

    const request = new NextRequest(`http://localhost/api/athletes/${deleteAthleteId}`, {
      method: 'DELETE'
    })
    
    const response = await executeHandler(DELETE, request)
    expect(response.status).toBe(204)
  })
})
