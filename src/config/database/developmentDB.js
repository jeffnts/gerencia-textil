import { MONGO_URI } from '../utils/constants'
const mongoose = require('mongoose')


module.exports ={

    connect: () =>{
        mongoose.connect(MONGO_URI, {useNewUrlParser: true });
        mongoose.Promise = global.Promise
        mongoose.connection.once('open', () =>{
            console.log('Database connected.')
        })
    }
}

