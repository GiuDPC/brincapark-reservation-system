const Reservation = require('../models/Reservation');

class ReservationRepository {
    async create(data) {
        return await Reservation.create(data);
    }

    async findAll() {
        return await Reservation.find().sort({ createdAt: -1 });
    }

    async findById(id) {
        return await Reservation.findById(id);
    }

    async findByDateAndPark(fecha, hora, parque) {
        return await Reservation.findOne({
            fechaServicio: fecha,
            horaReservacion: hora,
            parque: parque
        });
    }

    async findApproved() {
        return await Reservation.find({ estadoReserva: 'aprobado' });
    }

    async update(id, data) {
        return await Reservation.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await Reservation.findByIdAndDelete(id);
    }
}

module.exports = new ReservationRepository();