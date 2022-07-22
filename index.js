var log = console.log

const express = require('express')
const app = express()
const morgan = require('morgan')
app.use(morgan(function (tokens, req, res) {
    if(tokens.method(req,res) === "GET") {
        console.log("THIS IS A GET");
    }
    if(tokens.method(req,res) === "POST") {
        console.log("THIS IS A POST");
        return [
            tokens.method(req, res),
            tokens.url(req, res),
            tokens.status(req, res),
            tokens.res(req, res, 'content-length'), '-',
            tokens['response-time'](req, res), 'ms',
            JSON.stringify(req.body)
          ].join(' ')
        }
    })
)

app.use(express.json())
const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
  }
  app.use(requestLogger)
  app.use(morgan('combined'))
  morgan.token('type', function (req, res) { return req.headers['content-type'] })

let phoneBook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
];
let notes = [
    {
        id: 1,
        content: "HTML is easy",
        date: "2022-05-30T17:30:31.098Z",
        important: true
    },
    {
        id: 2,
        content: "Browser can execute only Javascript",
        date: "2022-05-30T18:39:34.091Z",
        important: false
    },
    {
        id: 3,
        content: "GET and POST are the most important methods of HTTP protocol",
        date: "2022-05-30T19:20:14.298Z",
        important: true
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})
app.get('/info', (request, response) => {
    response.send(`<h1>Phonebook has info for ${phoneBook.length} people </h1> <h2> ${new Date()} </h2>`)
})

app.get('/api/phonebook', (request, response) => {
    response.json(phoneBook)
})
app.get('/api/phonebook/:id', (request, response) => {
    const id = Number(request.params.id);
    const number = phoneBook.find(number => {
        return number.id === id
    })

    if (number) {
        response.json(number)
    } else {
        response.status(404).end()
    }
})

app.delete('/api/phonebook/:id', (request, response) => {
    const id = Number(request.params.id)
    phoneBook = phoneBook.filter(number => number.id !== id)

    response.status(204).end()
})

const generateId = () => {
    const maxId = phoneBook.length > 0
        ? Math.max(...phoneBook.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/phonebook', (request, response) => {
    const body = request.body
    const takenName = phoneBook.some(el=> el.name === body.name )
    if (!body.name || !body.number) {
        return response.status(400).json({
            error: 'name and/or number missing'
        })
    }else if(takenName){
        return response.status(400).json({
            error: 'name already taken!'
        })
    }

    const entry = {
        name: body.name,
        number: body.number,
        date: new Date(),
        id: generateId(),
    }

    phoneBook = phoneBook.concat(entry)

    response.json(entry)
    // log(body.name, body.number)
    
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  
  app.use(unknownEndpoint)

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)