const reservationRepository = require('../repositories/reservation.repository');
const pricingService = require('./pricing.service');

class AnalyticsService {


    async getStats() {
        const reservas = await reservationRepository.findAll();
        const aprobadas = reservas.filter(r => r.estadoReserva === 'aprobado');

        let ingresoTotal = 0;
        for (const reserva of aprobadas) {
            const precio = await pricingService.calculatePrice(reserva);
            ingresoTotal += precio;
        }

        return {
            totalReservas: reservas.length,
            reservasAprobadas: aprobadas.length,
            reservasPendientes: reservas.filter(r => r.estadoReserva === 'pendiente').length,
            reservasCanceladas: reservas.filter(r => r.estadoReserva === 'cancelado').length,
            ingresoTotal: ingresoTotal,
            moneda: 'USD'
        };
    }

    async getMonthlyData() {
        const reservas = await reservationRepository.findAll();
        const ahora = new Date();
        const meses = [];

        for (let i = 5; i >= 0; i--) {
            const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
            const mes = fecha.toLocaleString('es', { month: 'short' });
            const anio = fecha.getFullYear();
            meses.push({ mes: `${mes} ${anio}`, reservas: 0, ingresos: 0 });
        }

        for (const reserva of reservas) {
            const fechaReserva = new Date(reserva.createdAt);
            const mesIndex = meses.findIndex(m => {
                const [mesNombre, anio] = m.mes.split(' ');
                const mesNum = fechaReserva.toLocaleString('es', { month: 'short' });
                return mesNombre === mesNum && anio == fechaReserva.getFullYear();
            });

            if (mesIndex !== -1) {
                meses[mesIndex].reservas++;
                if (reserva.estadoReserva === 'aprobado') {
                    const precio = await pricingService.calculatePrice(reserva);
                    meses[mesIndex].ingresos += precio;
                }
            }
        }

        return {
            meses: meses.map(m => m.mes),
            reservas: meses.map(m => m.reservas),
            ingresos: meses.map(m => m.ingresos)
        };
    }

    async getTopClients() {
        const reservas = await reservationRepository.findAll();
        const clientesMap = {};

        reservas.forEach(r => {
            if (!clientesMap[r.correo]) {
                clientesMap[r.correo] = {
                    nombre: r.nombreCompleto,
                    correo: r.correo,
                    totalReservas: 0,
                    totalGastado: 0
                };
            }
            clientesMap[r.correo].totalReservas++;
        });

        for (const correo in clientesMap) {
            const reservasCliente = reservas.filter(r => r.correo === correo && r.estadoReserva === 'aprobado');
            for (const reserva of reservasCliente) {
                const precio = await pricingService.calculatePrice(reserva);
                clientesMap[correo].totalGastado += precio;
            }
        }

        const topClientes = Object.values(clientesMap)
            .sort((a, b) => b.totalReservas - a.totalReservas)
            .slice(0, 10);

        return topClientes;
    }

    async getCancellationAnalysis() {
        const reservas = await reservationRepository.findAll();
        const canceladas = reservas.filter(r => r.estadoReserva === 'cancelado');

        const porParque = {
            Maracaibo: 0,
            Caracas: 0,
            'Punto Fijo': 0
        };

        canceladas.forEach(r => {
            if (porParque[r.parque] !== undefined) {
                porParque[r.parque]++;
            }
        });

        return {
            totalCanceladas: canceladas.length,
            tasaCancelacion: reservas.length > 0 ? (canceladas.length / reservas.length * 100).toFixed(2) : 0,
            porParque: porParque
        };
    }
}

module.exports = new AnalyticsService();
