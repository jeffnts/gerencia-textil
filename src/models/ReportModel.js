import path from 'path'
import { connect, Document, EmbeddedDocument } from 'camo'

import Piece from './PieceModel'
import Count from './CountModel'

let database;
const uri = 'nedb://'+path.join(__dirname,'..', 'public', 'database')
connect(uri).then(function(db) {
  database = db;
});


class pieces extends EmbeddedDocument{
  constructor(){
    super()
    this.schema({
      amount:{
        type: Number
      },

      piece: Piece
    })
  }
}

export default class Report extends Document {
  constructor() {
    super();


    this.schema({
      name:{
        type: String
      },

      number:{
        type: Number,
        default: 0
      },

      reference:{
        type: String
      },

      pieces: [pieces],

      workers:{
        type: Number
      },

      createdAt: {
        type: Date,
        default: Date.now
      }
    })
  }

  static collectionName() {
    return 'reports';
  }

  async preSave(){
    const countNumber = Count.create({
      number: 1
    })

    await countNumber.save()

    this.number = await Count.count({})

    this.name = `REF - ${this.number < 10? '0'+this.number: this.number }`
  }

}
