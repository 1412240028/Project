from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json
import os # Untuk cek apakah file ada

app = Flask(__name__)
CORS(app)

# --- KONFIGURASI FILE JSON ---
TRANSACTIONS_FILE = 'transactions.json'
# Path lengkap ke file JSON di folder 'Back End'
# Pastikan folder 'Back End' ada di level yang sama dengan 'app.py'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FILE_PATH = os.path.join(BASE_DIR, TRANSACTIONS_FILE)

# --- FUNGSI UNTUK MENGELOLA FILE JSON ---
def load_transactions():
    """Memuat data transaksi dari file JSON."""
    if not os.path.exists(FILE_PATH) or os.stat(FILE_PATH).st_size == 0:
        return [] # Kembalikan list kosong jika file tidak ada atau kosong
    try:
        with open(FILE_PATH, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        # Jika file JSON rusak/kosong, kembalikan list kosong
        print(f"Warning: {TRANSACTIONS_FILE} is empty or corrupted. Starting with an empty list.")
        return []
    except Exception as e:
        print(f"Error loading transactions: {e}")
        return []

def save_transactions(data):
    """Menyimpan data transaksi ke file JSON."""
    try:
        with open(FILE_PATH, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4) # indent=4 untuk format JSON yang rapi
    except Exception as e:
        print(f"Error saving transactions: {e}")

# Inisialisasi daftar transaksi saat aplikasi dimulai
# Sekarang kita memuatnya dari file, bukan lagi list kosong biasa
transactions = load_transactions()

@app.route('/')
def home():
    return "Backend Kasir UD. ANUGRAH is running and serving from JSON file!"

@app.route('/transactions', methods=['GET'])
def get_transactions():
    """Mengembalikan semua riwayat transaksi dari file JSON."""
    # Pastikan kita mendapatkan data terbaru setiap kali dipanggil
    current_transactions = load_transactions()
    return jsonify(current_transactions)

@app.route('/transactions', methods=['POST'])
def add_transaction():
    """Menerima dan menyimpan transaksi baru ke file JSON."""
    if not request.is_json:
        return jsonify({"error": "Request must be JSON"}), 400

    data = request.get_json()

    required_fields = ['productCode', 'productName', 'quantity', 'total', 'payment', 'change']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    # Muat ulang transaksi dari file untuk memastikan data paling baru
    current_transactions = load_transactions()
    
    # Tambahkan timestamp ke data transaksi
    data['timestamp'] = datetime.now().isoformat()
    # Tambahkan ID, pastikan unik (walaupun sederhana, ini bisa lebih baik di DB)
    data['id'] = len(current_transactions) + 1 if current_transactions else 1 

    current_transactions.append(data) # Tambahkan transaksi ke list
    save_transactions(current_transactions) # Simpan list yang sudah diupdate ke file JSON

    return jsonify({"message": "Transaction added successfully", "transaction": data}), 201

@app.route('/clear_transactions', methods=['POST'])
def clear_transactions():
    """Menghapus semua riwayat transaksi dari file JSON."""
    save_transactions([]) # Simpan list kosong ke file JSON
    # Setelah menghapus, juga kosongkan variabel 'transactions' di memori
    # ini penting agar get_transactions berikutnya tidak mengambil dari memori lama
    global transactions
    transactions = [] 
    return jsonify({"message": "Transaction history cleared successfully"}), 200

if __name__ == '__main__':
    # Jalankan aplikasi Flask
    # host='0.0.0.0' agar bisa diakses dari perangkat lain di jaringan lokal
    # debug=True akan mereload server otomatis jika ada perubahan kode
    app.run(debug=True, host='127.0.0.1', port=5000)