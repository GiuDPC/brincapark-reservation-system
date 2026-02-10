import { Request, Response, NextFunction } from 'express';
import reservationService from '../services/reservation.service';

const reservationController = {
    create: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservation = await reservationService.createReservation(req.body);
            res.status(201).json(reservation);
        } catch (error) {
            next(error);
        }
    },

    getAll: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservations = await reservationService.getAllReservations();
            res.json(reservations);
        } catch (error) {
            next(error);
        }
    },

    getById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservation = await reservationService.getReservationById(req.params.id as string);
            res.json(reservation);
        } catch (error) {
            next(error);
        }
    },

    update: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservation = await reservationService.updateReservation(req.params.id as string, req.body);
            res.json(reservation);
        } catch (error) {
            next(error);
        }
    },

    delete: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const reservation = await reservationService.deleteReservation(req.params.id as string);
            res.json(reservation);
        } catch (error) {
            next(error);
        }
    }
};

export default reservationController;