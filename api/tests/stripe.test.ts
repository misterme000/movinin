import 'dotenv/config'
import request from 'supertest'
import mongoose from 'mongoose'
import * as movininTypes from ':movinin-types'
import app from '../src/app'
import * as databaseHelper from '../src/common/databaseHelper'
import * as testHelper from './testHelper'
import stripeAPI from '../src/stripe'
import * as env from '../src/config/env.config'
import Booking from '../src/models/Booking'

//
// Connecting and initializing the database before running the test suite
//
beforeAll(async () => {
  testHelper.initializeLogger()

  const res = await databaseHelper.Connect(env.DB_URI, false, false) && await databaseHelper.initialize()
  expect(res).toBeTruthy()
})

//
// Closing and cleaning the database connection after running the test suite
//
afterAll(async () => {
  if (mongoose.connection.readyState) {
    await databaseHelper.Close()
  }
})

describe('POST /api/create-checkout-session', () => {
  it('should create checkout session', async () => {
    //
    // Test create checkout session whith non existant user
    //
    const receiptEmail = testHelper.GetRandomEmail()
    const payload: movininTypes.CreatePaymentPayload = {
      amount: 234,
      currency: 'usd',
      receiptEmail,
      customerName: 'John Doe',
      locale: 'en',
      name: 'BMW X1',
      description: 'BookCars Testing Service',
    }
    let res = await request(app)
      .post('/api/create-checkout-session')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.sessionId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()

    //
    // Test create checkout session whith existant user
    //
    try {
      res = await request(app)
        .post('/api/create-checkout-session')
        .send(payload)
      expect(res.statusCode).toBe(200)
      expect(res.body.sessionId).not.toBeNull()
      expect(res.body.customerId).not.toBeNull()
    } finally {
      const customers = await stripeAPI.customers.list({ email: receiptEmail })
      if (customers.data.length > 0) {
        for (const customer of customers.data) {
          await stripeAPI.customers.del(customer.id)
        }
      }
    }

    //
    // Test create checkout sessions failure
    //
    payload.receiptEmail = 'xxxxxxxxxxxxxxx'
    res = await request(app)
      .post('/api/create-checkout-session')
      .send(payload)
    expect(res.statusCode).toBe(400)
    expect(res.body).toStrictEqual({})
  })
})

describe('POST /api/check-checkout-session/:sessionId', () => {
  it('should check checkout session', async () => {
    //
    // Checkout session does not exist
    //
    let res = await request(app)
      .post('/api/check-checkout-session/xxxxxxxxxx')
    expect(res.statusCode).toBe(204)

    //
    // Checkout session exists but booking does not exist
    //
    const receiptEmail = testHelper.GetRandomEmail()
    const payload: movininTypes.CreatePaymentPayload = {
      amount: 234,
      currency: 'usd',
      receiptEmail,
      customerName: 'John Doe',
      locale: 'en',
      name: 'BMW X1',
      description: 'BookCars Testing Service',
    }
    res = await request(app)
      .post('/api/create-checkout-session')
      .send(payload)
    expect(res.statusCode).toBe(200)
    const { sessionId } = res.body
    expect(sessionId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()
    res = await request(app)
      .post(`/api/check-checkout-session/${sessionId}`)
    expect(res.statusCode).toBe(204)

    //
    // Checkout session exists and booking exists and payment failed
    //
    const expireAt = new Date()
    expireAt.setSeconds(expireAt.getSeconds() + env.BOOKING_EXPIRE_AT)
    const from = new Date()
    from.setDate(from.getDate() + 1)
    const to = new Date(from)
    to.setDate(to.getDate() + 3)

    const booking = new Booking({
      agency: testHelper.GetRandromObjectId(),
      property: testHelper.GetRandromObjectId(),
      renter: testHelper.GetRandromObjectId(),
      location: testHelper.GetRandromObjectId(),
      from: new Date(2024, 2, 1),
      to: new Date(1990, 2, 4),
      status: movininTypes.BookingStatus.Void,
      expireAt,
      sessionId,
      cancellation: true,
      price: 4000,
    })
    try {
      await booking.save()

      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId}`)
      expect(res.statusCode).toBe(400)
    } finally {
      await booking.deleteOne()
    }

    //
    // Test database failure
    //
    try {
      databaseHelper.Close()
      res = await request(app)
        .post(`/api/check-checkout-session/${sessionId}`)
      expect(res.statusCode).toBe(400)
    } finally {
      const dbRes = await databaseHelper.Connect(env.DB_URI, false, false) && await databaseHelper.initialize()
      expect(dbRes).toBeTruthy()
    }
  })
})

describe('POST /api/create-payment-intent', () => {
  it('should create payment intents', async () => {
    //
    // Test create payment intent whith non existant user
    //
    const receiptEmail = testHelper.GetRandomEmail()
    const payload: movininTypes.CreatePaymentPayload = {
      amount: 234,
      currency: 'usd',
      receiptEmail,
      customerName: 'John Doe',
      locale: 'en',
      name: 'BookCars Testing Service',
      description: '',
    }
    let res = await request(app)
      .post('/api/create-payment-intent')
      .send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.paymentIntentId).not.toBeNull()
    expect(res.body.customerId).not.toBeNull()

    //
    // Test create payment intent whith existant user
    //
    try {
      res = await request(app)
        .post('/api/create-payment-intent')
        .send(payload)
      expect(res.statusCode).toBe(200)
      expect(res.body.paymentIntentId).not.toBeNull()
      expect(res.body.customerId).not.toBeNull()
    } finally {
      const customers = await stripeAPI.customers.list({ email: receiptEmail })
      if (customers.data.length > 0) {
        for (const customer of customers.data) {
          await stripeAPI.customers.del(customer.id)
        }
      }
    }

    //
    // Test create payment intent failure
    //
    payload.receiptEmail = 'xxxxxxxxxxxxxxx'
    res = await request(app)
      .post('/api/create-payment-intent')
      .send(payload)
    expect(res.statusCode).toBe(400)
    expect(res.body).toStrictEqual({})
  })
})