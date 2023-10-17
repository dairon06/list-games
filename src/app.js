import express from "express";
import cors from "cors";
import "dotenv/config";
import { pool } from "./db.js";
import { error } from "console";

const app = express();

app.use(express.json());
app.use(cors());

//obtener todos los juegos
app.get("/juegos", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM juegos");
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No hay ningun registro" });
    }
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Obtener un juego por su id
app.get("/juegos/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const result = await pool.query("SELECT * FROM juegos WHERE id_juego= $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No hay ningun registro" });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//Crear un juego
app.post("/juegos", async (req, res) => {
  const { nombre, imagen, genero, plataforma, año_lanzamiento } = req.body;

  if (typeof nombre !== "string") {
    return res.status(400).json({ message: "Error en la peticion" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO juegos (nombre, imagen, genero, plataforma, año_lanzamiento) VALUES ($1,$2,$3,$4,$5)",
      [nombre, imagen, genero, plataforma, año_lanzamiento]
    );
    res.status(201).json({
      message: "Juego creado",
    });
  } catch (err) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//Metodo update
app.put("/juegos/:id", async (req, res) => {
  const id = req.params.id;
  const { jugado } = req.body;
  if (typeof jugado !== "boolean") {
    return res.status(400).json({ mensaje: "Error en la peticion" });
  }
  try {
    const result = await pool.query(
      "UPDATE juegos SET jugado=$1 WHERE id_juego=$2 RETURNING *",
      [jugado, id]
    );
    res.json({
      message: "Juego actualizado exitosamente",
      body: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      message: error.message,
    });
  }
});

//Metodo delete
app.delete("/juegos/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    const result = await pool.query("DELETE FROM juegos WHERE id_juego =$1", [
      id,
    ]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "No se encontro el recurso",
      });
    }
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "not found" });
});

const port = process.env.PORT ?? 3000;

app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
