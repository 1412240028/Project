document.addEventListener('DOMContentLoaded', () => {
    // Ambil elemen-elemen HTML yang akan kita interaksikan
    const transactionForm = document.getElementById('transactionForm');
    const productCodeInput = document.getElementById('productCode');
    const quantityInput = document.getElementById('quantity');
    const resultCard = document.getElementById('result');
    const totalPriceSpan = document.getElementById('totalPrice');
    const paymentInput = document.getElementById('payment');
    const calculateChangeBtn = document.getElementById('calculateChangeBtn');
    const changeSpan = document.getElementById('change');
    const resetBtn = document.getElementById('resetBtn');
    const newTransactionBtn = document.getElementById('newTransactionBtn');
    const productItems = document.querySelectorAll('.product-item');
    
    // Elemen untuk Riwayat Transaksi
    const historyListDiv = document.getElementById('historyList');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const noHistoryMessage = document.querySelector('.no-history-message');

    // === URL Backend Flask kita ===
    const API_BASE_URL = 'http://127.0.0.1:5000'; // Sesuaikan dengan host dan port Flask kamu

    // Data produk (tetap di frontend karena ini data statis untuk tampilan dan validasi awal)
    const products = {
        1: { name: "Tahu Mateng (Kecil)", price: 500 },
        2: { name: "Tahu Mentah (Kecil)", price: 500 },
        3: { name: "Tahu Mateng (Besar)", price: 700 },
        4: { name: "Tahu Mentah (Besar)", price: 700 },
        5: { name: "Tempe", price: 1000 }
    };

    let currentTotal = 0; // Variabel untuk menyimpan total harga saat ini

    // === Fungsi untuk Berkomunikasi dengan Backend ===
    const fetchHistoryFromBackend = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/transactions`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching history:', error);
            alert('Gagal memuat riwayat transaksi dari server. Coba lagi nanti.');
            return []; // Kembalikan array kosong jika gagal
        }
    };

    const postTransactionToBackend = async (transactionData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/transactions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(transactionData)
            });
            if (!response.ok) {
                // Backend akan mengembalikan pesan error dalam JSON jika ada masalah
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
            }
            const data = await response.json();
            return data; // Mengembalikan respons dari backend
        } catch (error) {
            console.error('Error posting transaction:', error);
            alert('Gagal menyimpan transaksi ke server: ' + error.message);
            return null;
        }
    };

    const clearHistoryOnBackend = async () => {
        try {
            // Untuk menghapus semua, kita bisa pakai endpoint POST baru atau DELETE.
            // Untuk demo sederhana, kita bisa pakai POST ke endpoint baru `/clear-transactions`
            // Atau, kita bisa ubah endpoint POST /transactions menjadi PUT/PATCH/DELETE
            // Untuk sementara kita akan buat Flask backendnya bisa mereset riwayat dengan POST kosong
            // Ini akan kita sesuaikan di Flask nanti. Untuk sekarang, kita asumsi ada endpoint DELETE.
            const response = await fetch(`${API_BASE_URL}/clear_transactions`, {
                method: 'POST', // Kita akan buat ini jadi POST di backend nanti
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || response.statusText}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error clearing history:', error);
            alert('Gagal membersihkan riwayat di server: ' + error.message);
            return null;
        }
    };

    // Fungsi untuk menampilkan riwayat di UI
    const renderHistory = async () => {
        const transactionHistory = await fetchHistoryFromBackend(); // Ambil dari backend
        historyListDiv.innerHTML = ''; // Kosongkan dulu daftar riwayat yang ada

        if (!transactionHistory || transactionHistory.length === 0) {
            noHistoryMessage.style.display = 'block'; // Tampilkan pesan 'Belum ada transaksi'
            clearHistoryBtn.style.display = 'none'; // Sembunyikan tombol clear
        } else {
            noHistoryMessage.style.display = 'none'; // Sembunyikan pesan
            clearHistoryBtn.style.display = 'inline-flex'; // Tampilkan tombol clear
            
            // Tampilkan riwayat dari yang terbaru (reverse)
            // Pastikan data timestamp ada dan valid untuk sorting
            const sortedHistory = transactionHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            sortedHistory.forEach((transaction) => {
                const historyItem = document.createElement('div');
                historyItem.classList.add('history-item');
                historyItem.innerHTML = `
                    <div class="item-details">
                        <span class="item-name">${transaction.productName} (${transaction.quantity}x)</span>
                        <span class="item-date">${new Date(transaction.timestamp).toLocaleString('id-ID')}</span>
                    </div>
                    <span class="item-total">Rp. ${transaction.total.toLocaleString('id-ID')}</span>
                `;
                historyListDiv.appendChild(historyItem);
            });
        }
    };

    // Fungsi untuk mereset tampilan dan nilai input
    const resetForm = () => {
        transactionForm.reset();
        resultCard.classList.add('hidden');
        totalPriceSpan.textContent = 'Rp. 0';
        paymentInput.value = '';
        changeSpan.textContent = 'Rp. 0';
        paymentInput.disabled = false;
        calculateChangeBtn.disabled = false;
        productCodeInput.focus();
    };

    // Event Listener untuk submit form transaksi (saat tombol 'Hitung Total' diklik)
    transactionForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const code = parseInt(productCodeInput.value);
        const quantity = parseInt(quantityInput.value);

        if (isNaN(code) || isNaN(quantity) || code < 1 || code > 5 || quantity < 1) {
            alert('Mohon masukkan kode produk dan jumlah yang valid!');
            return;
        }

        const product = products[code];

        if (product) {
            currentTotal = product.price * quantity;
            totalPriceSpan.textContent = `Rp. ${currentTotal.toLocaleString('id-ID')}`;

            resultCard.classList.remove('hidden');
            paymentInput.focus();
        } else {
            alert('Kode produk tidak ditemukan!');
            resetForm();
        }
    });

    // Event Listener untuk tombol 'Hitung Kembalian'
    calculateChangeBtn.addEventListener('click', async () => { // Tambahkan 'async' di sini
        const payment = parseInt(paymentInput.value);

        if (isNaN(payment) || payment < 0) {
            alert('Mohon masukkan jumlah pembayaran yang valid!');
            return;
        }

        if (payment < currentTotal) {
            alert(`Pembayaran kurang Rp. ${ (currentTotal - payment).toLocaleString('id-ID') }!`);
            return;
        }

        const change = payment - currentTotal;
        changeSpan.textContent = `Rp. ${change.toLocaleString('id-ID')}`;

        paymentInput.disabled = true;
        calculateChangeBtn.disabled = true;

        // === Simpan transaksi ke backend setelah kembalian dihitung ===
        const transaction = {
            productCode: productCodeInput.value,
            productName: products[parseInt(productCodeInput.value)].name,
            quantity: quantityInput.value,
            total: currentTotal,
            payment: payment,
            change: change,
            // Timestamp dan ID akan ditambahkan oleh backend
        };
        
        const backendResponse = await postTransactionToBackend(transaction);
        if (backendResponse) {
            // Jika berhasil disimpan di backend, baru update UI riwayat
            renderHistory();
        }
    });

    // Event Listener untuk tombol 'Reset'
    resetBtn.addEventListener('click', resetForm);

    // Event Listener untuk tombol 'Transaksi Baru' (sama seperti reset)
    newTransactionBtn.addEventListener('click', () => {
        resetForm();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Fitur bonus: Klik pada item produk di daftar akan mengisi otomatis kode produk
    productItems.forEach(item => {
        item.addEventListener('click', () => {
            const code = item.dataset.code;
            productCodeInput.value = code;
            quantityInput.focus();
        });
    });

    // === Event Listener untuk tombol 'Bersihkan Riwayat' ===
    clearHistoryBtn.addEventListener('click', async () => { // Tambahkan 'async' di sini
        if (confirm('Apakah Anda yakin ingin menghapus semua riwayat transaksi dari server?')) {
            const success = await clearHistoryOnBackend();
            if (success) {
                renderHistory(); // Render ulang riwayat yang kosong
            }
        }
    });

    // Inisialisasi: Sembunyikan result card dan muat riwayat dari backend saat halaman pertama kali dimuat
    resultCard.classList.add('hidden');
    renderHistory(); // Memuat riwayat saat halaman pertama kali dibuka
});