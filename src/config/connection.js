const mongoose = require('mongoose')

const connection = ()=>{
    try {
        mongoose.connect("mongodb+srv://ash631264:puowFI2pO8qjtyzG@cluster0.dyfm6sg.mongodb.net/vickram1025?retryWrites=true&w=majority&appName=Cluster0")
        console.log("connected database..")
        






        
    } catch (error) {
        console.log(`connection ${error.Message}`)
    }
}

module.exports = connection;