import Reservation, { IReservation } from '../models/Reservation';

class ReservationRepository {
    async create(data: Partial<IReservation>) {
        return await Reservation.create(data) as IReservation;
    }

    async findAll(): Promise<IReservation[]> {
        return await Reservation.find().sort({ createdAt: -1 });
    }

    async findById(id: string): Promise<IReservation | null> {
        return await Reservation.findById(id);
    }

    async findByDateAndPark(fecha: string, hora: string, parque: string): Promise<IReservation | null> {
        return await Reservation.findOne({
            fechaServicio: fecha,
            horaReservacion: hora,
            parque: parque
        });
    }

    async findApproved(): Promise<IReservation[]> {
        return await Reservation.find({ estadoReserva: 'aprobado' });
    }

    async update(id: string, data: Partial<IReservation>): Promise<IReservation | null> {
        return await Reservation.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id: string): Promise<IReservation | null> {
        return await Reservation.findByIdAndDelete(id);
    }
}

export default new ReservationRepository();