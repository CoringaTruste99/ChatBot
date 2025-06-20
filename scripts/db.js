// scripts/db.js
const mongoose = require('mongoose');

const conectarDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://CoringaFem:Qq1yClJ70Seztli6@cluster0.hw9jito.mongodb.net/ChatBot?retryWrites=true&w=majority');
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error);
    process.exit(1);
  }
};

module.exports = conectarDB;
