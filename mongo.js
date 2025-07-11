const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

// console.log(process.argv)
const password = process.argv[2]
const [name, number] = [process.argv[3], process.argv[4]]

const url =
  `mongodb+srv://ksh:${password}@cluster0.ubxhm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const bookSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Book = mongoose.model('Book', bookSchema)

const book = new Book({
  name: name,
  number: number,
})

// List all Contacts
if (process.argv.length === 3) {
  console.log('phonebook')
  Book.find({})
    .then(result => {
      result.forEach(person => {
        console.log(person.name, person.number)
      })
      mongoose.connection.close()
    })

  // Add to Contact
} else {
  book.save().then(result => {
    // console.log(result)
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}