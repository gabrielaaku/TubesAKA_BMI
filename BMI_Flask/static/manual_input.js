document.getElementById("calculateBmiBtn").addEventListener("click", function() {
    // Ambil nilai dari input
    const weight = parseFloat(document.getElementById("weight").value);
    const height = parseFloat(document.getElementById("height").value);
    const method = document.getElementById("method").value;

    if (isNaN(weight) || isNaN(height) || weight <= 0 || height <= 0) {
        // Validasi input
        document.getElementById("bmiResult").innerHTML = "<span style='color: red;'>Masukkan nilai berat dan tinggi yang valid!</span>";
        return;
    }

    // Fungsi menghitung BMI
    const calculateBmi = (weight, height) => (weight / ((height / 100) ** 2)).toFixed(2);

    // Fungsi rekursif
    const calculateRecursive = (data, index = 0, results = []) => {
        if (index >= data.length) return results;
        results.push(calculateBmi(data[index][0], data[index][1]));
        return calculateRecursive(data, index + 1, results);
    };

    // Fungsi iteratif
    const calculateIterative = (data) => {
        return data.map(([w, h]) => calculateBmi(w, h));
    };

    // Data input tunggal dalam array
    const data = [
        [weight, height]
    ];

    let bmiResult;
    let totalTime = 0;

    // Lakukan 10 kali perhitungan untuk menghitung rata-rata waktu
    for (let i = 0; i < 10; i++) {
        const startTime = performance.now();

        if (method === "iterative") {
            // Perhitungan iteratif
            bmiResult = calculateIterative(data)[0];
        } else if (method === "recursive") {
            // Perhitungan rekursif
            bmiResult = calculateRecursive(data)[0];
        }

        const endTime = performance.now();
        totalTime += (endTime - startTime) * 1e6; // Konversi ke nanodetik
    }

    // Rata-rata waktu dalam nanodetik
    const averageTime = (totalTime / 10).toFixed(2);

    // Tentukan kategori BMI
    let category = "";
    if (bmiResult < 18.5) {
        category = "Kekurangan berat badan";
    } else if (bmiResult >= 18.5 && bmiResult < 24.9) {
        category = "Normal";
    } else if (bmiResult >= 25 && bmiResult < 29.9) {
        category = "Kelebihan berat badan";
    } else {
        category = "Obesitas";
    }

    // Tampilkan hasil
    document.getElementById("bmiResult").innerHTML = `
        <p>BMI Anda: <strong>${bmiResult}</strong></p>
        <p>Kategori: <strong>${category}</strong></p>
        <p>Metode: <strong>${method.charAt(0).toUpperCase() + method.slice(1)}</strong></p>
        <p>Rata-rata Waktu Proses(10x percobaan): <strong>${averageTime} ns</strong></p>
    `;
});