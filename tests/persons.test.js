require('dotenv').config()
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Person = require('../models/person')
const api = supertest(app)

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI)
})

beforeEach(async () => {
  await Person.deleteMany({})
  await new Person({ name: 'Arto Hellas', number: '040-123456' }).save()
})

afterAll(async () => {
  await mongoose.connection.close()
})

test('GET /api/persons returns JSON and one default person', async () => {
  const res = await api.get('/api/persons')
  expect(res.status).toBe(200)
  expect(res.headers['content-type']).toMatch(/application\/json/)
  expect(res.body).toHaveLength(1)
})

test('POST /api/persons succeeds with valid data', async () => {
  const newPerson = { name: 'Ada Lovelace', number: '123-456789' } // ✅ valid

  await api.post('/api/persons').send(newPerson).expect(200)

  const persons = await Person.find({})
  expect(persons).toHaveLength(2)
})

test('PUT /api/persons/:id updates a person', async () => {
  const person = await Person.findOne({ name: 'Arto Hellas' })

  const updated = { name: 'Arto Hellas', number: '12-3456789' } // ✅ valid

  const res = await api.put(`/api/persons/${person._id}`).send(updated).expect(200)

  expect(res.body.number).toBe('12-3456789')
})

test('POST /api/persons fails with 400 if name or number missing', async () => {
  const noName = { number: '123456' }
  const noNumber = { name: 'Grace Hopper' }

  await api.post('/api/persons').send(noName).expect(400)
  await api.post('/api/persons').send(noNumber).expect(400)

  const persons = await Person.find({})
  expect(persons).toHaveLength(1)
})

test('DELETE /api/persons/:id deletes a person', async () => {
  const [person] = await Person.find({})
  const idToDelete = person._id

  await api.delete(`/api/persons/${idToDelete}`).expect(204)

  const personsAtEnd = await Person.find({})
  expect(personsAtEnd).toHaveLength(0)
})
