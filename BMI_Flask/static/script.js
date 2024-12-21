document.getElementById("calculateBtn").addEventListener("click", function() {
    const dataSize = document.getElementById("dataSize").value;
    const method = document.getElementById("method").value;

    if (method === "compare") {
        fetch(`/compare/${dataSize}`) // Panggil endpoint baru
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Gagal mengambil data perbandingan dari server");
                }
                return response.json();
            })
            .then((data) => {
                const labels = data.labels; // Label untuk grafik
                const recursiveTimes = data.recursiveTimes; // Waktu rekursif
                const iterativeTimes = data.iterativeTimes; // Waktu iteratif

                updateComparisonChart(labels, recursiveTimes, iterativeTimes); // Perbarui grafik perbandingan
            })
            .catch((error) => {
                console.error("Kesalahan:", error);
            });
    } else {
        fetch(`/calculate/${dataSize}/${method}`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Gagal mengambil data dari server");
                }
                return response.json();
            })
            .then((data) => {
                const results = data.times;
                const bmiData = data.bmi;

                const labels = results.map((item) => item[0]);
                const times = results.map((item) => item[1]);

                updateChart(labels, times, method);
                updateTable(bmiData.slice(0, parseInt(dataSize)));
            })
            .catch((error) => {
                console.error("Kesalahan:", error);
            });
    }
});

function updateComparisonChart(labels, recursiveTimes, iterativeTimes) {
    const ctx = document.getElementById("chart").getContext("2d");
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                    label: "Rekursif",
                    data: recursiveTimes,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                },
                {
                    label: "Iteratif",
                    data: iterativeTimes,
                    borderColor: "rgba(54, 162, 235, 1)",
                    backgroundColor: "rgba(54, 162, 235, 0.2)",
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Jumlah Data",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Waktu (ns)",
                    },
                },
            },
        },
    });
}




function updateChart(labels, times, method) {
    const ctx = document.getElementById("chart").getContext("2d");
    if (window.myChart) {
        window.myChart.destroy(); // Hapus grafik lama
    }
    window.myChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                label: method === "recursive" ? "Rekursif" : "Iteratif",
                data: times,
                borderColor: method === "recursive" ? "rgba(255, 99, 132, 1)" : "rgba(54, 162, 235, 1)",
                backgroundColor: method === "recursive" ? "rgba(255, 99, 132, 0.2)" : "rgba(54, 162, 235, 0.2)",
            }],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "Jumlah Data",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "Waktu (ns)",
                    },
                },
            },
        },
    });
}

function updateTable(bmiData) {
    const tableBody = document.querySelector("#bmiTable tbody");
    tableBody.innerHTML = ""; // Kosongkan isi tabel sebelumnya

    bmiData.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${item.weight}</td>
            <td>${item.height}</td>
            <td>${item.bmi}</td>
        `;
        tableBody.appendChild(row);
    });
}


document.getElementById("bmiForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Mencegah form refresh

    const weight = document.getElementById("weight").value;
    const height = document.getElementById("height").value;

    fetch("/calculate-bmi-manual", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({ weight, height }),
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error("Gagal menghitung BMI");
            }
            return response.json();
        })
        .then((data) => {
            const resultDiv = document.getElementById("result");
            resultDiv.innerHTML = `
                <p>BMI Anda: <strong>${data.bmi}</strong></p>
                <p>Kategori: <strong>${data.category}</strong></p>
            `;
        })
        .catch((error) => {
            console.error("Kesalahan:", error);
        });
});