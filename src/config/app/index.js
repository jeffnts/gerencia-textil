function databaseConnection(){
  if(process.env.NODE_ENV === 'test'){
    const database = require('../database/testDB')
    database.connect()
  }
  else if(process.env.NODE_ENV === 'production'){
    const database = require('../database/productionDB')
    database.connect()
  }else{
    const database = require('../database/developmentDB')
    database.connect()
  }

}


module.exports  = {
  databaseConnection
}
