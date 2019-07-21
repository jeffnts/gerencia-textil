import { connect, Document, EmbeddedDocument } from 'camo'
import path from 'path'

let database;
const uri = 'nedb://'+path.join(__dirname,'..', 'public', 'database')
connect(uri).then(function(db) {
  database = db;
})


class steps extends EmbeddedDocument{
  constructor(){
    super()
    this.schema({
      step:{
        type: Number
      },

      machine:{
        type: String
      },

      description:{
        type: String
      },

      minutes:{
        type: Number
      },

      seconds:{
        type: Number
      }
    })
  }
}

class  totalTime extends EmbeddedDocument{
  constructor(){
    super()
    this.schema({
      hours:{
        type: Number,
        required: true
      },

      minutes:{
        type: Number,
        required: true
      },

      seconds:{
        type: Number,
        required: true
      }
    })
}
}

export default class Piece extends Document {
  constructor() {
    super()
    this.schema({
      name: {
        type: String
      },

      image: {
        type: String
      },
      steps: [steps],

      totalTime,

      createdAt: {
        type: Date,
        default: Date.now
      }
    })


  }

  static collectionName() {
    return 'pieces'
  }
}

