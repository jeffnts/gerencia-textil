import { connect, Document } from 'camo'
import path from 'path'

let database;
const uri = 'nedb://'+path.join(__dirname,'..', 'public', 'database')
connect(uri).then(function(db) {
  database = db;
})

export default class Count extends Document{
  constructor(){
    super()
    this.schema({
      number:{
        type: Number,
        default: 0
      }
    })
  }

  static collectionName() {
    return 'count';
  }
}
