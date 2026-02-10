import configRepository from '../repositories/config.repository';
import { IReservation } from '../models/Reservation';

class PrincingService {
    async calculatePrice(reserva: IReservation) {
        const config = await configRepository.getConfig();
        const esFinDeSemana = this.isWeekend(reserva.fechaServicio);

        const preciosMap = {
            mini: esFinDeSemana ? config.paquetes.mini.viernes : config.paquetes.mini.lunes,
            mediano: esFinDeSemana ? config.paquetes.mediano.viernes : config.paquetes.mediano.lunes,
            full: esFinDeSemana ? config.paquetes.full.viernes : config.paquetes.full.lunes,
        };

        return preciosMap[reserva.paquete as keyof typeof preciosMap];
    }

    isWeekend(fechaString: string) {
        const [year, month, day] = fechaString.split("-").map(Number);
        const fecha = new Date(year, month - 1, day);
        const dia = fecha.getDay();
        return dia === 0 || dia === 5 || dia === 6;
    }

    async calculateTotalRevenue(reservas: IReservation[]) {
        let total = 0;
        for (const reserva of reservas) {
            const precio = await this.calculatePrice(reserva);
            total += precio;
        }
        return total;
    }
}

export default new PrincingService();
