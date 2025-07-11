// app.js
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('post-data', (req) =>
  req.method === 'POST' ? JSON.stringify(req.body) : ''
)
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.post('/api/persons', (request, response, next) => {
  const { name, number } = request.body

  if (!name || !number) {
    return response.status(400).json({ error: 'Content missing' })
  }

  const person = new Person({ name, number })
  person
    .save()
    .then(() => response.json(person))
    .catch((e) => next(e))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then((persons) => response.json(persons))
    .catch((error) => next(error))
})

app.get('/info', (request, response, next) => {
  Person.find({})
    .then((persons) => {
      const now = new Date()
      response.send(`
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${now}</p>
      `)
    })
    .catch((error) => next(error))
})

app.get('/health', (request, response, next) => {
  response.status(200).send('OK')
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id.toString())
    .then((result) => {
      if (result) {
        response.status(204).end()
      } else {
        response.status(404).json({ error: 'Person not found' })
      }
    })
    .catch((error) => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      if (updatedPerson) {
        response.json(updatedPerson)
      } else {
        response.status(404).json({ error: 'Unable to update' })
      }
    })
    .catch((e) => next(e))
})

const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformed id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'Unknown endpoint' })
}

app.use(errorHandler)
app.use(unknownEndpoint)

module.exports = app
