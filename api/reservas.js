const express = require('express');
const ruta = express.Router();
const db = require('../db/models/index.js');

ruta.post('/reservar', async (req, res) => {
    const { libro_id, persona_id } = req.body;
    const rpta = await db.reserva.create(req.body);

    const [libro, persona] = await Promise.all([
        db.libro.findByPk(libro_id),
        db.persona.findByPk(persona_id)
    ]);

    await Promise.all([
        libro.increment('contador', { by: 1 }),
        libro.update({ ultimo_reservante: persona.nombres })
    ]);

    res.status(200).json(rpta);
});

const getPagedReservas = async (req, res, order, where = {}) => {
    const { id, page = 1 } = req.query;
    const pageSize = 2;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const reservas = await db.reserva.findAll({
        order,
        where: { persona_id: id, ...where },
        include: { model: db.libro, as: 'reservado' }
    });

    const totalItems = reservas.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const itemsAPaginar = JSON.stringify(reservas.slice(start, end));

    return res.status(200).json({ page, totalPages, pageSize, totalItems, items: JSON.parse(itemsAPaginar) });
};

ruta.get('/persona', async (req, res) => getPagedReservas(req, res, [['id', 'DESC']]));

ruta.get('/leer', async (req, res) => res.status(200).json(await db.reserva.findByPk(req.query.id, {
    include: [{ model: db.libro, as: 'reservado' }, { model: db.persona, as: 'reservante' }]
})));

ruta.get('/ultimas', async (req, res) => getPagedReservas(req, res, [['fecha_inicio', 'DESC']]));

ruta.get('/ultimasAdmin', async (req, res) => getPagedReservas(req, res, [['fecha_inicio', 'DESC']], {}));

ruta.get('/proximos', async (req, res) => {
    const { id, page = 1 } = req.query;
    const pageSize = 2;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    const reservas = await db.reserva.findAll({
        order: [['fecha_final', 'ASC']],
        where: { persona_id: id },
        include: { model: db.libro, as: 'reservado' }
    });

    const hoy = new Date(obtenerFechaActual());
    const rpta = reservas.filter(item => item.fecha_final >= hoy);

    const totalItems = rpta.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const itemsAPaginar = JSON.stringify(rpta.slice(start, end));

    return res.status(200).json({ page, totalPages, pageSize, totalItems, items: JSON.parse(itemsAPaginar) });
});

function obtenerFechaActual() {
    const hoy = new Date();
    const [year, mes, dia] = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'), String(hoy.getDate()).padStart(2, '0')];
    return `${year}-${mes}-${dia}`;
}

module.exports = ruta;