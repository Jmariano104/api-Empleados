require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Conectado exitosamente a MongoDB Atlas'))
  .catch(err => console.error('Error de conexión:', err));

// Modelo para la colección "Empleados"
const empleadoSchema = new mongoose.Schema({
  clave: { type: Number, required: true, unique: true },
  nombre: { type: String, required: true },
  direccion: String,
  fechadenacimiento: Date,      // se guarda como BSON Date
  sexo: String,
  tipodesangre: String
});
const Empleado = mongoose.model('Empleado', empleadoSchema, 'Empleados');

// POST: insertar empleado
app.post('/api/empleados', async (req, res) => {
  try {
    const guardado = await new Empleado(req.body).save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// GET: todos los empleados
app.get('/api/empleados', async (req, res) => {
  try {
    res.json(await Empleado.find());
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// GET: un empleado por clave
app.get('/api/empleados/:clave', async (req, res) => {
  try {
    const emp = await Empleado.findOne({ clave: req.params.clave });
    if (!emp) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    res.json(emp);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// PUT: actualizar por clave
app.put('/api/empleados/:clave', async (req, res) => {
  try {
    const act = await Empleado.findOneAndUpdate(
      { clave: req.params.clave }, req.body,
      { new: true, runValidators: true }
    );
    if (!act) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    res.json(act);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// DELETE: eliminar por clave
app.delete('/api/empleados/:clave', async (req, res) => {
  try {
    const del = await Empleado.findOneAndDelete({ clave: req.params.clave });
    if (!del) return res.status(404).json({ mensaje: 'Empleado no encontrado' });
    res.json({ mensaje: 'Empleado eliminado', empleado: del });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));