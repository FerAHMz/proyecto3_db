document.addEventListener('DOMContentLoaded', function() {
    //Fechas por defecto
    const hoy = new Date().toISOString().split('T')[0];
    const inputsFecha = document.querySelectorAll('input[type="date"]');
    inputsFecha.forEach(input => input.value = hoy);
    
    //Asignación de eventos
    document.getElementById('btn-reservas').addEventListener('click', generarReporteReservas);
    document.getElementById('btn-ingresos').addEventListener('click', generarReporteIngresos);
    document.getElementById('btn-clientes').addEventListener('click', generarReporteClientes);
    document.getElementById('btn-disponibilidad').addEventListener('click', generarReporteDisponibilidad);
    document.getElementById('btn-cancelaciones').addEventListener('click', generarReporteCancelaciones);

    //Asegurar el estilo de los contenedores de gráficas
    document.querySelectorAll('.chart-container').forEach(container => {
        container.style.height = '400px';
        container.style.margin = '20px 0';
    });

    //Inicialización de gráficas de ejemplo
    initExampleCharts();
});

//Función para inicializar todas las gráficas de ejemplo
function initExampleCharts() {
    createReservasChart();
    createIngresosChart();
    createClientesChart();
    createDisponibilidadChart();
    createCancelacionesChart();
}

//Gráfica para reporte de reservas
function createReservasChart() {
    const ctx = document.getElementById('grafica-reservas').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            //BACKEND: Reemplazar con datos reales de reservas por período
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [{
                label: 'Reservas por mes',
                //BACKEND: Datos reales de cantidad de reservas
                data: [12, 19, 3, 5, 2, 3],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                title: {
                    display: true,
                    text: 'Reservas por Mes (Ejemplo)'
                }
            }
        }
    });
}

//Gráfica para reporte de ingresos
function createIngresosChart() {
    const ctx = document.getElementById('grafica-ingresos').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            //BACKEND: Reemplazar con períodos reales
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
                label: 'Ingresos por semana ($)',
                //BACKEND: Datos reales de ingresos
                data: [1250, 1890, 1820, 1940],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Ingresos Semanales (Ejemplo)'
                }
            }
        }
    });
}

//Gráfica para reporte de clientes
function createClientesChart() {
    const ctx = document.getElementById('grafica-clientes').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            //BACKEND: Reemplazar con categorías reales de clientes
            labels: ['Nuevos', 'Recurrentes', 'Inactivos'],
            datasets: [{
                label: 'Distribución de clientes',
                //BACKEND: Datos reales de distribución
                data: [300, 500, 100],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Tipos de Clientes (Ejemplo)'
                }
            }
        }
    });
}

//Gráfica para reporte de disponibilidad
function createDisponibilidadChart() {
    const ctx = document.getElementById('grafica-disponibilidad').getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            //BACKEND: Reemplazar con nombres de canchas
            labels: ['Cancha 1', 'Cancha 2', 'Cancha 3', 'Cancha 4', 'Cancha 5'],
            datasets: [{
                label: 'Horas disponibles',
                //BACKEND: Datos reales de disponibilidad
                data: [12, 19, 8, 15, 10],
                fill: true,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Disponibilidad por Cancha (Ejemplo)'
                }
            }
        }
    });
}

//Gráfica para reporte de cancelaciones
function createCancelacionesChart() {
    const ctx = document.getElementById('grafica-cancelaciones').getContext('2d');
    new Chart(ctx, {
        type: 'pie',
        data: {
            //BACKEND: Reemplazar con razones reales de cancelación
            labels: ['Cliente', 'Clima', 'Mantenimiento', 'Otros'],
            datasets: [{
                label: 'Razones de cancelación',
                //BACKEND: Datos reales de cancelaciones
                data: [15, 8, 3, 4],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Razones de Cancelación (Ejemplo)'
                }
            }
        }
    });
}

//Funciones de generación de reportes (simuladas)
function generarReporteReservas() {
    console.log("Generando reporte de reservas...");
    //BACKEND: Implementar llamada al API para obtener datos reales
    //BACKEND: Actualizar gráfica con nuevos datos usando myChart.update()
    alert("Reporte de Reservas generado (simulado)");
}

function generarReporteIngresos() {
    console.log("Generando reporte de ingresos...");
    //BACKEND: Implementar llamada al API para obtener datos reales
    //BACKEND: Actualizar gráfica con nuevos datos usando myChart.update()
    alert("Reporte de Ingresos generado (simulado)");
}

function generarReporteClientes() {
    console.log("Generando reporte de clientes...");
    //BACKEND: Implementar llamada al API para obtener datos reales
    //BACKEND: Actualizar gráfica con nuevos datos usando myChart.update()
    alert("Reporte de Clientes generado (simulado)");
}

function generarReporteDisponibilidad() {
    console.log("Generando reporte de disponibilidad...");
    //BACKEND: Implementar llamada al API para obtener datos reales
    //BACKEND: Actualizar gráfica con nuevos datos usando myChart.update()
    alert("Reporte de Disponibilidad generado (simulado)");
}

function generarReporteCancelaciones() {
    console.log("Generando reporte de cancelaciones...");
    //BACKEND: Implementar llamada al API para obtener datos reales
    //BACKEND: Actualizar gráfica con nuevos datos usando myChart.update()
    alert("Reporte de Cancelaciones generado (simulado)");
}

//Funciones de exportación (simuladas)
function exportarPDF(tipo) {
    console.log(`Exportando ${tipo} a PDF`);
    //BACKEND: Implementar generación real de PDF
    alert(`Funcionalidad de exportación a PDF para ${tipo} (simulada)`);
}

function exportarExcel(tipo) {
    console.log(`Exportando ${tipo} a Excel`);
    //BACKEND: Implementar generación real de Excel
    alert(`Funcionalidad de exportación a Excel para ${tipo} (simulada)`);
}