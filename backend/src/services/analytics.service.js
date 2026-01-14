const reservationRepository = require('../repositories/reservation.repository');
const pricingService = require('./pricing.service');

class AnalyticsService {


    async getStats() {
        const reservas = await reservationRepository.findAll();
        const aprobadas = reservas.filter(r => r.estadoReserva === 'aprobado');
        const pendientes = reservas.filter(r => r.estadoReserva === 'pendiente');

        // Calcular ingresos totales
        let ingresoTotal = 0;
        for (const reserva of aprobadas) {
            const precio = await pricingService.calculatePrice(reserva);
            ingresoTotal += precio;
        }

        // Ingreso promedio
        const ingresoPromedio = aprobadas.length > 0 ? ingresoTotal / aprobadas.length : 0;

        // Tasa de conversion (pendientes que se volvieron aprobados)
        const tasaConversion = reservas.length > 0
            ? ((aprobadas.length / reservas.length) * 100).toFixed(2)
            : 0;

        // Por tipo de evento
        const porTipoEvento = {};
        reservas.forEach(r => {
            const tipo = r.tipoEvento || 'Otros';
            porTipoEvento[tipo] = (porTipoEvento[tipo] || 0) + 1;
        });

        // Por parque
        const porParque = {};
        reservas.forEach(r => {
            porParque[r.parque] = (porParque[r.parque] || 0) + 1;
        });

        // Dia mas popular (por fecha de servicio)
        const diasSemana = {};
        reservas.forEach(r => {
            if (r.fechaServicio) {
                const [year, month, day] = r.fechaServicio.split('-').map(Number);
                const fecha = new Date(year, month - 1, day);
                const diaSemana = fecha.toLocaleDateString('es', { weekday: 'long' });
                diasSemana[diaSemana] = (diasSemana[diaSemana] || 0) + 1;
            }
        });
        const diaMasPopular = Object.keys(diasSemana).length > 0
            ? Object.entries(diasSemana).sort((a, b) => b[1] - a[1])[0][0]
            : 'N/A';

        // Paquete mas vendido
        const paquetes = {};
        reservas.forEach(r => {
            paquetes[r.paquete] = (paquetes[r.paquete] || 0) + 1;
        });
        const paqueteMasVendido = Object.keys(paquetes).length > 0
            ? Object.entries(paquetes).sort((a, b) => b[1] - a[1])[0][0]
            : 'N/A';

        return {
            totalReservas: reservas.length,
            reservasAprobadas: aprobadas.length,
            reservasPendientes: pendientes.length,
            reservasCanceladas: reservas.filter(r => r.estadoReserva === 'cancelado').length,
            ingresoTotal: ingresoTotal,
            ingresoPromedio: ingresoPromedio,
            tasaConversion: parseFloat(tasaConversion),
            moneda: 'USD',
            porTipoEvento: porTipoEvento,
            porParque: porParque,
            diaMasPopular: diaMasPopular.charAt(0).toUpperCase() + diaMasPopular.slice(1),
            paqueteMasVendido: paqueteMasVendido
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
            ingresos: meses.map(m => m.ingresos),
            moneda: 'USD'
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
                    totalGastado: 0,
                    aprobadas: 0,
                    canceladas: 0
                };
            }
            clientesMap[r.correo].totalReservas++;

            // Contar por estado
            if (r.estadoReserva === 'aprobado') {
                clientesMap[r.correo].aprobadas++;
            } else if (r.estadoReserva === 'cancelado') {
                clientesMap[r.correo].canceladas++;
            }
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

        // Por parque
        const porParque = {
            Maracaibo: 0,
            Caracas: 0,
            'Punto Fijo': 0
        };

        // Por paquete
        const porPaquete = {
            mini: 0,
            mediano: 0,
            full: 0
        };

        canceladas.forEach(r => {
            // Contar por parque
            if (porParque[r.parque] !== undefined) {
                porParque[r.parque]++;
            }
            // Contar por paquete
            if (porPaquete[r.paquete] !== undefined) {
                porPaquete[r.paquete]++;
            }
        });

        return {
            total: canceladas.length,
            tasaCancelacion: reservas.length > 0 ? (canceladas.length / reservas.length * 100).toFixed(2) : 0,
            porParque: porParque,
            porPaquete: porPaquete
        };
    }
}

module.exports = new AnalyticsService();
