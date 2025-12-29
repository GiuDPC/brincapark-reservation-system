const reservationService = require('../services/reservation.service');

exports.create = async (req, res, next) => {
    try {
        const reservation = await reservationService.createReservation(req.body);
        res.status(201).json(reservation);
    } catch (error) {
        next(error);
    }
};

exports.getAll = async (req, res, next) => {
    try {
        const reservations = await reservationService.getAllReservations();
        res.json(reservations);
    } catch (error) {
        next(error);
    }
};

exports.getById = async (req, res, next) => {
    try {
        const reservation = await reservationService.getReservationById(req.params.id);
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const reservation = await reservationService.updateReservation(req.params.id, req.body);
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};

exports.delete = async (req, res, next) => {
    try {
        const reservation = await reservationService.deleteReservation(req.params.id);
        res.json(reservation);
    } catch (error) {
        next(error);
    }
};