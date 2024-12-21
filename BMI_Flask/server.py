from flask import Flask, render_template, jsonify
import time
import sys
sys.setrecursionlimit(10000)  # Atur batas kedalaman rekursi (contoh: 10.000)


app = Flask(__name__)

# Fungsi untuk menghitung BMI
def calculate_bmi(weight, height):
    return round(weight / ((height / 100) ** 2), 2)

# Rekursif menghitung BMI
def calculate_recursive(data, index=0, results=None):
    if results is None:
        results = []
    if index >= len(data):
        return results
    weight, height = data[index]
    results.append(calculate_bmi(weight, height))
    return calculate_recursive(data, index + 1, results)

# Iteratif menghitung BMI
def calculate_iterative(data):
    return [calculate_bmi(weight, height) for weight, height in data]


def read_bmi_data():
    try:
        with open("bmi_data_5000.txt", "r") as file:
            lines = file.readlines()
        data = [(float(line.split(",")[1]), float(line.split(",")[0])) for line in lines]
        print(f"Data berhasil dibaca ({len(data)} baris):", data[:5])  # Log jumlah data dan contoh data
        return data
    except FileNotFoundError:
        print("File bmi_data_5000.txt tidak ditemukan!")
        return []


@app.route("/")
def index():
    return render_template("index.html")

@app.route("/select-data")
def select_data():
    return render_template("select_data.html")

@app.route("/calculate/<int:count>/<method>")
def calculate(count, method):
    data = read_bmi_data()[:count]  # Ambil data sesuai jumlah yang dipilih pengguna

    if not data:
        return jsonify({"error": "Data tidak ditemukan"}), 404

    # Hitung BMI
    bmi_results = [{"weight": weight, "height": height, "bmi": calculate_bmi(weight, height)} for weight, height in data]

    results = []
    if method == "recursive":
        # Perhitungan rekursif
        for i in range(10, count + 1, 10):  # Kelipatan 10
            subset = data[:i]  # Ambil subset data
            start_recursive = time.perf_counter_ns()
            calculate_recursive(subset)  # Panggil fungsi rekursif
            end_recursive = time.perf_counter_ns()
            recursive_time = end_recursive - start_recursive  # Total waktu
            results.append((i, recursive_time))

    elif method == "iterative":
        # Perhitungan iteratif
        for i in range(10, count + 1, 10):  # Kelipatan 10
            subset = data[:i]  # Ambil subset data
            start_iterative = time.perf_counter_ns()
            calculate_iterative(subset)  # Panggil fungsi iteratif
            end_iterative = time.perf_counter_ns()
            iterative_time = end_iterative - start_iterative  # Total waktu
            results.append((i, iterative_time))
    else:
        return jsonify({"error": "Metode tidak valid"}), 400

    return jsonify({"times": results, "bmi": bmi_results})

@app.route("/compare/<int:count>")
def compare(count):
    data = read_bmi_data()[:count]

    if not data:
        return jsonify({"error": "Data tidak ditemukan"}), 404

    labels = list(range(10, count + 1, 10))
    recursive_times = []
    iterative_times = []

    for i in labels:
        subset = data[:i]

        # Hitung waktu rekursif
        start_recursive = time.perf_counter_ns()
        calculate_recursive(subset)
        end_recursive = time.perf_counter_ns()
        recursive_times.append(end_recursive - start_recursive)

        # Hitung waktu iteratif
        start_iterative = time.perf_counter_ns()
        calculate_iterative(subset)
        end_iterative = time.perf_counter_ns()
        iterative_times.append(end_iterative - start_iterative)

    return jsonify({
        "labels": labels,
        "recursiveTimes": recursive_times,
        "iterativeTimes": iterative_times,
    })


    
@app.route("/manual-input")
def manual_input():
    return render_template("manual_input.html")

@app.route("/calculate-bmi-manual", methods=["POST"])
def calculate_bmi_manual():
    from flask import request
    weight = float(request.form.get("weight"))
    height = float(request.form.get("height"))

    bmi = calculate_bmi(weight, height)
    category = ""
    if bmi < 18.5:
        category = "Underweight"
    elif 18.5 <= bmi < 24.9:
        category = "Normal weight"
    elif 25 <= bmi < 29.9:
        category = "Overweight"
    else:
        category = "Obese"

    return jsonify({"bmi": bmi, "category": category})


if __name__ == "__main__":
    app.run(debug=True)
    
    
