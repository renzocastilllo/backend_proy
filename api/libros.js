const express = require('express');
const ruta = express.Router();
const db = require('../db/models/index.js');
const { Op } = require("sequelize");

ruta.get('/busqueda', async (req, res) => {
    const { keyword = '', type = '', filters = [], page = '' } = req.query;
    const pageSize = 5;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const libros = await db.libro.findAll({
        order: [['id', 'ASC']],
        where: {
            [Op.or]: {
                titulo: { [Op.iLike]: filters.includes('titulo') ? `%${keyword}%` : 'título_default' },
                autor: { [Op.iLike]: filters.includes('autor') ? `%${keyword}%` : 'autor_default' },
                topicos: { [Op.iLike]: filters.includes('genero') ? `%${keyword}%` : 'género_default' },
                isbn: { [Op.iLike]: filters.includes('isbn') ? `%${keyword}%` : 'isbn_default' },
            },
            tipo: { [Op.iLike]: `%${type}%` }
        },
        include: {
            model: db.reserva,
            as: 'reservado',
            attributes: ['id', 'fecha_final'],
            order: [['id', 'DESC']]
        }
    });

    const currentDate = new Date();
    const response = libros.map(libro => ({
        ...libro.get({ plain: true }),
        disponible: libro.reservado.some(reserva => new Date(reserva.fecha_final) > currentDate)
    })).slice(start, end);

    return res.status(200).json({
        page,
        totalPages: Math.ceil(response.length / pageSize),
        pageSize,
        totalItems: response.length,
        items: response
    });
});

ruta.get('/leer', async (req, res) => {
    const { id } = req.query;
    const libro = await db.libro.findByPk(id, {
        include: {
            model: db.reserva,
            as: 'reservado',
            attributes: ['id', 'fecha_final'],
            order: [['id', 'DESC']]
        }
    });

    const currentDate = new Date();
    const response = {
        ...libro.get({ plain: true }),
        disponible: libro.reservado.some(reserva => new Date(reserva.fecha_final) > currentDate)
    };

    res.status(200).json(response);
});

ruta.post('/agregar', async (req, res) => {
    const response = await db.libro.create(req.body);
    res.status(200).json(response);
});

ruta.delete('/eliminar', async (req, res) => {
    const { id } = req.query;
    const response = await db.libro.destroy({ where: { id } });

    res.status(200).json(response);
});

ruta.put('/modificar', async (req, res) => {
    const { id } = req.query;
    const libro = await db.libro.findByPk(id);
    await libro.update(req.body);
    res.json({ mensaje: 'Libro modificado correctamente' });
});

ruta.get('/MasPedidos', async (req, res) => {
    const { page } = req.query;
    const pageSize = 2;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const librosPopulares = await db.libro.findAll({
        where: { contador: { [Op.gt]: 0 } },
        order: [['contador', 'DESC']],
    });

    const response = librosPopulares.slice(start, end);

    res.status(200).json({
        page,
        totalPages: Math.ceil(response.length / pageSize),
        pageSize,
        totalItems: response.length,
        items: response
    });
});

function getCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

module.exports = ruta;