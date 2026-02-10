import reservationRepository from '../repositories/reservation.repository';
import AppError from '../utils/AppError';
import { IReservation } from '../models/Reservation';

class ReservationService {
    async createReservation(data: Partial<IReservation>): Promise<IReservation> {
        // validamos datos
        this.validateReservation(data);

        //verificar datos duplicados
        const exists = await reservationRepository.findByDateAndPark(
            data.fechaServicio!,
            data.horaReservacion!,
            data.parque!
        );
 
        if (exists) {
            throw new AppError('Ya existe una reserva para esta fecha y hora', 400);
        }

        //creamos la reserva
        return await reservationRepository.create(data);
    }

    async getAllReservations(): Promise<IReservation[]> {
        return await reservationRepository.findAll();
    }

    async getReservationById(id: string): Promise<IReservation> {
        const reservation = await reservationRepository.findById(id);
        if (!reservation) {
            throw new AppError('Reserva no encontrada', 404);
        }
        return reservation;
    }

    async updateReservation(id: string, data: Partial<IReservation>): Promise<IReservation> {
        //aqui verifico si existe eas reserva
        await this.getReservationById(id);

        //verificamos datos duplicados excluyendo el dato actual
        const exists = await reservationRepository.findByDateAndPark(
            data.fechaServicio!,
            data.horaReservacion!,
            data.parque!
        );

        if (exists && exists._id.toString() !== id) {
            throw new AppError('El horario ya esta ocupado', 409);
        }

        return await reservationRepository.update(id, data) as IReservation;

    }

    async deleteReservation(id: string): Promise<IReservation> {
        await this.getReservationById(id);
        return await reservationRepository.delete(id) as IReservation;
    }

    validateReservation(data: Partial<IReservation>): void {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[0-9]{11}$/;

        if (!data.nombreCompleto || data.nombreCompleto.length < 3) {
            throw new AppError('Nombre invalido', 400);
        }

        if (!emailRegex.test(data.correo!)) {
            throw new AppError('Formato del correo invalid', 400);
        }

        if (!phoneRegex.test(data.telefono!)) {
            throw new AppError('Formato del telefono debe tener 11 digitos', 400);
        }
    }
}

export default new ReservationService();