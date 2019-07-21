const mongoose = require('mongoose');

module.exports ={

    connect: () =>{
        mongoose.connect(process.env.URL_DB_TESTS, {useNewUrlParser: true });
        mongoose.Promise = global.Promise;
        mongoose.connection.once('open', () =>{
            console.log('Test database connected.');
        });
    },
    disconect: () => {
        mongoose.disconnect(process.env.URL_DB_TESTS, {useNewUrlParser: true });
        mongoose.Promise = global.Promise;
        mongoose.connection.once('close', () =>{
            console.log('Test database disconnected.');
        });
    }
};