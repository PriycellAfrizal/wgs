// ========================
// Inisialisasi DataTable
// ========================
$(document).ready(function () {
    $('#dataOC').DataTable();
});

// ========================
// Format & Parse Rupiah
// ========================
function formatRupiah(number) {
    return 'Rp ' + Number(number).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiah(str) {
    if (!str) return 0;
    str = str.replace(/Rp\.?\s?/g, '').replace(/\./g, '').replace(',', '.');
    return parseFloat(str) || 0;
}

// ========================
// Variabel Global
// ========================
let prevJumlahPembayaran = 0;
let prevPpnPembayaran = 0;
let prevPph = 0;
let prevPersentasePembayaran = 0;
let isManualPpn = false;

let isManualPph = false;
let isUpdatingFromPersentase = false;

// ========================
// Fungsi Validasi & Hitung
// ========================
function validateAndCalculatePembayaran() {
    const jumlahPembayaranEl = document.getElementById('jumlahpembayaran');
    const ppnPembayaranEl = document.getElementById('ppnpembayaran');
    const pphEl = document.getElementById('pph');
    const persentasePembayaranEl = document.getElementById('persentasepembayaran');

    const totalFixed = parseRupiah(document.getElementById('totalallpembayaranfixed').value);
    const subtotalsisaOC = parseRupiah(document.getElementById('subtotalsisaOC').value);
    const subtotalOC = parseRupiah(document.getElementById('subtotalOC').value);

    let jumlahPembayaran = parseRupiah(jumlahPembayaranEl.value);
    let pph = parseRupiah(pphEl.value);
    let ppnPembayaran = parseRupiah(ppnPembayaranEl.value);

    if (isNaN(jumlahPembayaran)) jumlahPembayaran = 0;
    if (isNaN(pph)) pph = 0;
    if (isNaN(ppnPembayaran)) ppnPembayaran = 0;

    // Hanya hitung otomatis PPN jika bukan input dari persentase atau manual PPN
  if (!isManualPpn && !isManualPph && !isUpdatingFromPersentase) {
 
        ppnPembayaran = Math.round(jumlahPembayaran * 0.11);
    }

    const totalAllPembayaran = jumlahPembayaran + ppnPembayaran - pph;

    if (totalAllPembayaran > totalFixed) {
        alert("Total pembayaran melebihi batas yang diperbolehkan!");

        jumlahPembayaranEl.value = formatRupiah(prevJumlahPembayaran);
        ppnPembayaranEl.value = formatRupiah(prevPpnPembayaran);
        pphEl.value = formatRupiah(prevPph);
        document.getElementById('totalallpembayaran').value =
            formatRupiah(prevJumlahPembayaran + prevPpnPembayaran - prevPph);
        return;
    }

    let persentasePembayaran = (subtotalOC > 0) ? (jumlahPembayaran / subtotalOC) * 100 : 0;
    const maxPersentase = (subtotalsisaOC / subtotalOC) * 100;

    if (persentasePembayaran > maxPersentase) {
        alert(`Persentase melebihi batas maksimal (${maxPersentase.toFixed(2)}%)`);
        return;
    }

    // Simpan nilai valid
    prevJumlahPembayaran = jumlahPembayaran;
    prevPpnPembayaran = ppnPembayaran;
    prevPph = pph;
    prevPersentasePembayaran = persentasePembayaran;

    // Tampilkan hasil
    ppnPembayaranEl.value = formatRupiah(ppnPembayaran);
    document.getElementById('totalallpembayaran').value = formatRupiah(totalAllPembayaran);

    if (!isUpdatingFromPersentase) {
        persentasePembayaranEl.value = persentasePembayaran.toFixed(2);
    }

    isManualPpn = false;
}

// ========================
// Event Listeners
// ========================
document.getElementById('jumlahpembayaran').addEventListener('input', () => {
    isManualPpn = false;
    validateAndCalculatePembayaran();
});

document.getElementById('ppnpembayaran').addEventListener('input', () => {
    isManualPpn = true;
    validateAndCalculatePembayaran();
});

document.getElementById('pph').addEventListener('input', validateAndCalculatePembayaran);

document.getElementById('persentasepembayaran').addEventListener('input', (e) => {
    isUpdatingFromPersentase = true;

    const persentase = parseFloat(e.target.value.replace(',', '.')) || 0;
    const subtotalOC = parseRupiah(document.getElementById('subtotalOC').value);
    const subtotalsisaOC = parseRupiah(document.getElementById('subtotalsisaOC').value);
    const totalFixed = parseRupiah(document.getElementById('totalallpembayaranfixed').value);

    const pph = parseRupiah(document.getElementById('pph').value);
    const ppn = parseRupiah(document.getElementById('ppnpembayaran').value); // digunakan seperti apa adanya

    const maxPersentase = (subtotalsisaOC / subtotalOC) * 100;

    if (persentase < 0 || persentase > maxPersentase) {
        alert(`Persentase tidak valid atau melebihi ${maxPersentase.toFixed(2)}%`);
        e.target.value = prevPersentasePembayaran.toFixed(2);
        isUpdatingFromPersentase = false;
        return;
    }

    const jumlah = (persentase / 100) * subtotalOC;
    const total = jumlah + ppn - pph;

    if (total > totalFixed) {
        alert("Total pembayaran melebihi batas!");
        e.target.value = prevPersentasePembayaran.toFixed(2);
        isUpdatingFromPersentase = false;
        return;
    }

    document.getElementById('jumlahpembayaran').value = formatRupiah(jumlah);

    validateAndCalculatePembayaran();
    isUpdatingFromPersentase = false;
});

// ========================
// Persentase PPN Manual
// ========================
document.getElementById('persentaseppn').addEventListener('input', function () {
    const persen = parseFloat(this.value.replace(',', '.')) || 0;
    const subtotal = parseRupiah(document.getElementById('subtotalsisaOC').value);
    const ppnValue = subtotal * (persen / 100);
    document.getElementById('ppnpembayaran').value = formatRupiah(ppnValue);

    isManualPpn = true;
    validateAndCalculatePembayaran();
});


// ========================
// Persentase PPH Manual
// ========================

document.getElementById('persentasepph').addEventListener('input', function () {
    const persen = parseFloat(this.value.replace(',', '.')) || 0;
    const subtotal = parseRupiah(document.getElementById('subtotalsisaOC').value);
    const pphValue = subtotal * (persen / 100);
    document.getElementById('pph').value = formatRupiah(pphValue);

    isManualPph = true; // Tambahkan baris ini agar PPN tidak dihitung otomatis
    validateAndCalculatePembayaran();
});







// ========================
// Optional: Fetch Total Pembayaran
// ========================
function fetchTotalPembayaran(oc, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'finance/get_total_pembayaran.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) {
            var responseText = xhr.responseText.trim();
            var totalPembayaran = parseFloat(responseText);
            if (!isNaN(totalPembayaran)) {
                callback(totalPembayaran);
            } else {
                console.error('Total pembayaran tidak valid:', responseText);
            }
        } else {
            console.error('Failed to fetch total pembayaran');
        }
    };
    xhr.send('oc=' + encodeURIComponent(oc));
}









 function closeModal() {
            document.getElementById('myModal').style.display = 'none';
        }
// Mendapatkan elemen modal
var modal = document.getElementById("myModal");

// Menambahkan event listener ke body untuk menutup modal saat klik di luar
document.body.addEventListener("click", function(event) {
  // Mengecek apakah target klik tidak sama dengan elemen modal dan tidak berada di dalam elemen modal
  if (event.target!== modal &&!modal.contains(event.target)) {
    // Menutup modal
    modal.style.display = "none";
  }
});


        var modal = document.getElementById('myModal');

    // Ketika pengguna mengklik di luar modul, tutup modulnya
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

 

    document.addEventListener("DOMContentLoaded", function() {
        var modal = document.getElementById("myModal");
        var span = document.getElementsByClassName("close")[0];
        var infoButtons = document.querySelectorAll('.infoButton'); // Mengganti editButtons menjadi infoButtons

   
        // Deklarasikan variabel infoButtons
        var infoButtons;

        infoButtons.forEach(function(button) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                var oc = this.dataset.oc;

                // Kirim permintaan AJAX ke PHP untuk mengambil data barang
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            var data = JSON.parse(xhr.responseText);
                            showDetails(data.barang); // Ubah sesuai struktur JSON yang diterima
                        } else {
                            alert("Gagal mengambil data dari server.");
                        }
                    }
                };

                xhr.open('GET', 'finance/get_barangfinance.php?oc=' + encodeURIComponent(oc), true);
                xhr.send();
            });
        });

     function showDetails(barang) {
    // Bersihkan isi tabel sebelum menambahkan data baru
    document.getElementById("barangTableBody").innerHTML = "";

    var nomor = 1; // Nomor awal

    // Tambahkan data barang ke dalam tabel
    barang.forEach(function(item) {
        var row = document.createElement("tr");
        row.innerHTML = "<td>" + nomor++ + "</td>" +
                        "<td>" + item.namabarang + "</td>" +
                        "<td>" + item.qty + "</td>" +
                        "<td>" + item.satuan + "</td>" +
                        "<td>" + item.price + "</td>" +
                        "<td>" + item.totalprice + "</td>";
        document.getElementById("barangTableBody").appendChild(row);
    });


            // Set nilai quotesDisplay dan salesDisplay

            document.getElementById("ocDisplay").textContent = barang[0].oc; // Ubah sesuai struktur JSON yang diterima


            document.getElementById("namacustomerDisplay").textContent = barang[0].namacustomer; // Ubah sesuai struktur JSON yang 


            document.getElementById("cpDisplay").textContent = barang[0].cp; // Ubah sesuai struktur JSON yang 


            document.getElementById("alamatDisplay").textContent = barang[0].alamat; // Ubah sesuai struktur JSON yang 





            document.getElementById("tglquotesDisplay").textContent = barang[0].tgloc; // Ubah sesuai struktur JSON yang diterima
          

            modal.style.display = "block";
        }
    });





function openModalOC(oc) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var dataInfo = JSON.parse(xhr.responseText);

                // Isi data dasar
                document.getElementById("ocOC").value = dataInfo.oc;
                document.getElementById("tglocOC").value = dataInfo.tgloc;
                document.getElementById("namacustomerOC").value = dataInfo.namacustomer;
                document.getElementById("pocustOC").value = dataInfo.pocust;
                document.getElementById("tglpoOC").value = dataInfo.tglpo;

                // Subtotal & subtotal sisa
                document.getElementById("subtotalOC").value = dataInfo.subtotal;

                document.getElementById("subtotalsisaOC").value = dataInfo.subtotalsisa;

                // Penagihan DPP (sisasubtotal)

                document.getElementById("jumlahpembayaran").value = dataInfo.penagihanDPP;



                document.getElementById("totalallOCasli").value = dataInfo.totalall;

                document.getElementById("totalallpembayaranfixed").value = dataInfo.totalallpembayaranfixed;





                // Persentase pembayaran
                document.getElementById("persentasepembayaran").value = dataInfo.persentasepembayaran;

                // Total all dan ppn (jika ada)
                document.getElementById("ppnOC").value = dataInfo.ppn;
                document.getElementById("totalallOC").value = dataInfo.totalall;

                showDetails(dataInfo.dataBarangOC);
            } else {
                alert("Failed to fetch information.");
            }
        }
    };

    xhr.open('GET', 'finance/get_data_oc.php?oc=' + encodeURIComponent(oc), true);
    xhr.send();

    var modalOC = document.getElementById("ModalOC");
    modalOC.style.display = "flex";

    window.addEventListener('click', function(event) {
        if (event.target == modalOC) {
            closeModalOC();
        }
    });
}



function closeModalOC() {
    var modalOC = document.getElementById("ModalOC");
    modalOC.style.display = "none";
}

function formatRupiah(angka) {
    var reverse = angka.toString().split('').reverse().join('');
    var ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');
    return 'Rp ' + ribuan;
}



function updateFormattedPrice(inputElement) {
    var inputValue = inputElement.value.replace(/[^\d]/g, ''); // Hapus karakter selain digit
    var formattedValue = formatRupiah(inputValue);

    // Tampilkan nilai yang diformat
    inputElement.value = formattedValue;
}

function showDetails(dataBarang) {
    var tableBody = document.getElementById("dataocBody");
    tableBody.innerHTML = "";

    dataBarang.forEach(function(barang, i) {
        var row = tableBody.insertRow(i);

        var cell1 = row.insertCell(0);
        var inputNamaBarang = document.createElement("select");
        inputNamaBarang.name = "namabarang[]";
        inputNamaBarang.classList.add("itemnamebaru");
        inputNamaBarang.style.width = "300px";
        inputNamaBarang.style.border = "none";
        caribarang(inputNamaBarang, barang.namabarang);
        cell1.appendChild(inputNamaBarang);

        var cell2 = row.insertCell(1);
        var inputQty = document.createElement("input");
        inputQty.type = "number";
        inputQty.name = "qty[]";
        inputQty.min = "1";
        inputQty.value = barang.qty;
        inputQty.style.width = "60px";

        // Store the original quantity for comparison
        inputQty.dataset.originalQty = barang.qty;

        // Add event listener to validate quantity
        inputQty.addEventListener("input", function() {
            var originalQty = parseInt(this.dataset.originalQty, 10);
            var newQty = parseInt(this.value, 10);

            if (newQty > originalQty) {
                this.value = originalQty; // Reset to originalQty if exceeds
                Swal.fire({
                    icon: 'error',
                    title: 'Quantity Exceeds Limit',
                    text: `Quantity cannot exceed the initial value of ${originalQty}.`
                });
            }

            barang.qty = this.value;
            updateTotalPrice(row, dataBarang, i); // Assuming this function is defined elsewhere
        });
        cell2.appendChild(inputQty);


        var cell3 = row.insertCell(2);
        var inputSatuan = document.createElement("input");
        inputSatuan.type = "text";
        inputSatuan.name = "satuan[]";
        inputSatuan.value = barang.satuan;
        inputSatuan.readOnly = true;
        inputSatuan.style.width = "90px";
        inputSatuan.style.border = "none";
        cell3.appendChild(inputSatuan);

        var cell4 = row.insertCell(3);
        var inputPrice = document.createElement("input");
        inputPrice.type = "text";
        inputPrice.name = "price[]";
        inputPrice.readOnly= true;
        inputPrice.style.border = "none";
        inputPrice.value = formatRupiah(barang.price);
        inputPrice.addEventListener("input", function() {
            var numericValue = this.value.replace(/[^\d]/g, ''); // Hanya angka
            barang.price = parseFloat(numericValue) || 0;
            this.value = formatRupiah(barang.price);
            updateTotalPrice(row, dataBarang, i);
        });
        cell4.appendChild(inputPrice);

        var cell5 = row.insertCell(4);
        var inputTotalPrice = document.createElement("input");
        inputTotalPrice.type = "text";
        inputTotalPrice.name = "totalprice[]";
        inputTotalPrice.value = formatRupiah(barang.totalprice);
        inputTotalPrice.readOnly = true;
        inputTotalPrice.style.border = "none";
        inputTotalPrice.dataset.previousValue = barang.totalprice;
        inputTotalPrice.addEventListener("input", function() {
            var numericValue = this.value.replace(/[^\d.]/g, '');
            barang.totalprice = parseFloat(numericValue) || 0;
            updateTotalAll(dataBarang);
            calculateSubtotalPPNTotalAll(getDataBarang());
        });
        cell5.appendChild(inputTotalPrice);

        // Kolom Aksi
        var cell6 = row.insertCell(5);
        var deleteButton = document.createElement("button");
        deleteButton.textContent = "Hapus";
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.style.color = "white";
        deleteButton.addEventListener("click", function() {
            tableBody.deleteRow(row.rowIndex - 1);
            calculateSubtotalPPNTotalAll(getDataBarang());
        });
        cell6.appendChild(deleteButton);
    });
}







function updateTotalPrice(inputElement, dataBarang) {
    var baris = inputElement.closest('tr');
    var qty = parseFloat(baris.querySelector('td:nth-child(2) input').value);
    var priceInput = baris.querySelector('td:nth-child(4) input');
    var priceValue = priceInput.value.replace(/[^\d.]/g, '');
    var price = parseFloat(priceValue.replace(/\./g, '')) || 0;
    var totalprice = qty * price;
    var totalpriceInput = baris.querySelector('td:nth-child(5) input');
    totalpriceInput.value = formatRupiah(totalprice);
    totalpriceInput.dataset.previousValue = totalprice;

    calculateSubtotalPPNTotalAll(dataBarang);
}

function calculateSubtotalPPNTotalAll(dataBarang) {
    var subtotal = 0;
    var ppn = 0;
    var totalall = 0;

    dataBarang.forEach(function(barang) {
        subtotal += parseFloat(barang.totalprice) || 0;
    });

    ppn = subtotal * 0.11;
    totalall = subtotal + ppn;

    document.getElementById("subtotalOC").value = formatRupiah(subtotal);
    document.getElementById("ppnOC").value = formatRupiah(ppn);
    document.getElementById("totalallOC").value = formatRupiah(totalall);
}

function getDataBarang() {
    var rows = document.querySelectorAll("#dataocBody tr");
    var dataBarang = [];

    rows.forEach(function(row) {
        var namabarang = row.querySelector('td:nth-child(1) select').value;
        var qty = parseFloat(row.querySelector('td:nth-child(2) input').value);
        var satuan = row.querySelector('td:nth-child(3) input').value;
        var priceInput = row.querySelector('td:nth-child(4) input');
        var priceValue = priceInput.value.replace(/[^\d.]/g, '');
        var price = parseFloat(priceValue.replace(/\./g, '')) || 0;
        var totalpriceInput = row.querySelector('td:nth-child(5) input');
        var totalpriceValue = totalpriceInput.value.replace(/[^\d.]/g, '');
        var totalprice = parseFloat(totalpriceValue.replace(/\./g, '')) || 0;

        dataBarang.push({
            namabarang: namabarang,
            qty: qty,
            satuan: satuan,
            price: price,
            totalprice: totalprice
        });
    });

    return dataBarang;
}

function validateAndSubmitForm() {
    var rows = document.querySelectorAll("#dataocBody tr");
    var errorMessages = [];
    var isValid = true;

    rows.forEach(function(row) {
        var namabarang = row.querySelector('td:nth-child(1) select').value;
        var qty = parseFloat(row.querySelector('td:nth-child(2) input').value);
        var satuan = row.querySelector('td:nth-child(3) input').value;
        var price = row.querySelector('td:nth-child(4) input').value.replace(/[^\d.]/g, '');
        var totalprice = row.querySelector('td:nth-child(5) input').value.replace(/[^\d.]/g, '');

        if (!namabarang || isNaN(qty) || !satuan || isNaN(parseFloat(price)) || isNaN(parseFloat(totalprice))) {
            isValid = false;
            errorMessages.push('Pastikan semua kolom diisi dengan benar.');
        }
    });

    if (!isValid) {
        alert(errorMessages.join('\n'));
        return false;
    }

    return true;
}











function tambahBaris() {
    var tableBody = document.getElementById("dataocBody");
    var newRow = tableBody.insertRow(-1); // Tambahkan baris baru ke akhir tabel (-1)

  // Kolom Nama Barang
var cell1 = newRow.insertCell(0);
var inputNamaBarang = document.createElement("select");
inputNamaBarang.name = "namabarang[]";

// Tambahkan kelas baru dan biarkan kelas yang sebelumnya
inputNamaBarang.classList.add("itemnamebaru");

// Panggil fungsi untuk mengambil daftar nama barang dari tabel masterbarang via AJAX
caribarang(inputNamaBarang, ''); // Kosongkan selectedValue untuk baris baru

// Tambahkan event listener untuk memantau perubahan pada pilihan nama barang
inputNamaBarang.addEventListener('change', function() {
    // Ambil data satuan dari tabel masterbarang berdasarkan nama barang yang dipilih
    var selectedOption = this.options[this.selectedIndex];
    var satuan = selectedOption.getAttribute('data-satuan');
    
    // Isi nilai satuan pada kolom Satuan
    inputSatuan.value = satuan;
});

inputNamaBarang.style.width = "300px";
cell1.appendChild(inputNamaBarang);








    // Kolom Quantity
    var cell2 = newRow.insertCell(1);
    var inputQty = document.createElement("input");
    inputQty.type = "number";
    inputQty.name = "qty[]";
    inputQty.min = "1";
    inputQty.value = 1; // Set default quantity to 1 for new row
    inputQty.addEventListener("input", function() {
        // Memanggil fungsi untuk memperbarui totalprice
        updateTotalPrice(newRow);
        // Memanggil fungsi untuk menghitung subtotal, PPN, dan totalall berdasarkan dataBarang yang diperbarui
        calculateSubtotalPPNTotalAll(getDataBarang());
    });









    inputQty.style.width = "60px";
    cell2.appendChild(inputQty);

    // Kolom Satuan
    var cell3 = newRow.insertCell(2);
    var inputSatuan = document.createElement("input");
    inputSatuan.type = "text";
    inputSatuan.name = "satuan[]";
    inputSatuan.value = ''; // Kosongkan satuan untuk baris baru
    inputSatuan.readOnly = true; // Tambahkan atribut readonly
    inputSatuan.style.width = "90px";
    inputSatuan.style.border = "none";
    cell3.appendChild(inputSatuan);



    // Kolom Harga
    var cell4 = newRow.insertCell(3);
    var inputPrice = document.createElement("input");
    inputPrice.type = "text";
    inputPrice.name = "price[]";
    inputPrice.value = ''; // Kosongkan harga untuk baris baru

    inputPrice.addEventListener("input", function() {
        var numericValue = this.value.replace(/[^\d]/g, ''); // Hanya angka
        numericPrice = parseFloat(numericValue) || 0;
        // Set nilai pada elemen input menggunakan formatRupiah
        this.value = formatRupiah(numericPrice);
        // Memanggil fungsi untuk memperbarui total price
        updateTotalPrice(newRow);
        // Memanggil fungsi untuk menghitung subtotal, PPN, dan totalall berdasarkan dataBarang yang diperbarui
        calculateSubtotalPPNTotalAll(getDataBarang());
    });
    cell4.appendChild(inputPrice);

    // Kolom Total Price
    var cell5 = newRow.insertCell(4);
    var inputTotalPrice = document.createElement("input");
    inputTotalPrice.type = "text";
    inputTotalPrice.name = "totalprice[]";
    inputTotalPrice.value = ''; // Kosongkan total harga untuk baris baru
    inputTotalPrice.readOnly = true; // Tambahkan atribut readonly
    inputTotalPrice.style.border = "none";
    inputTotalPrice.dataset.previousValue = 0; // Inisialisasi nilai sebelumnya sebagai 0
    cell5.appendChild(inputTotalPrice);


  // Kolom Aksi
    var cell6 = newRow.insertCell(5);
    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Hapus";
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.style.color = "white";
    deleteButton.addEventListener("click", function() {
        tableBody.deleteRow(newRow.rowIndex - 1);
        calculateSubtotalPPNTotalAll(getDataBarang());
    });
    cell6.appendChild(deleteButton);

    updateTotalPrice(newRow);
    calculateSubtotalPPNTotalAll(getDataBarang());
}



// Fungsi untuk memperbarui total price setiap kali ada perubahan pada kuantitas atau harga
function updateTotalPrice(row) {
    var qtyInput = row.querySelector('input[name="qty[]"]');
    var priceInput = row.querySelector('input[name="price[]"]');
    var totalPriceInput = row.querySelector('input[name="totalprice[]"]');
    var qty = parseFloat(qtyInput.value) || 0;
    var price = parseFloat(priceInput.value.replace(/[^\d]/g, '')) || 0;
    var totalPrice = qty * price;
    // Set nilai total price menggunakan formatRupiah
    
    totalPriceInput.value = formatRupiah(totalPrice);

    // Memanggil fungsi untuk menghitung subtotal, PPN, dan totalall berdasarkan dataBarang yang diperbarui
    calculateSubtotalPPNTotalAll(getDataBarang());
}

// Fungsi untuk menghitung ulang subtotal, PPN, dan totalall berdasarkan dataBarang yang diperbarui
function calculateSubtotalPPNTotalAll(dataBarang) {
    var subtotal = dataBarang.reduce(function(acc, item) {
        return acc + (item.totalprice || 0);
    }, 0);

    // Perbarui nilai subtotal di elemen dengan ID 'subtotalOC'
    document.getElementById('subtotalOC').value = formatRupiah(subtotal);

    // Hitung PPN (11% dari subtotal)
    var ppnRate = 0.11; // 11 persen
    var ppn = subtotal * ppnRate;

    // Perbarui nilai PPN di elemen dengan ID 'ppnOC'
    document.getElementById('ppnOC').value = formatRupiah(ppn);

    var totalall = subtotal + ppn;

    // Perbarui nilai totalall di elemen dengan ID 'totalallOC'
    document.getElementById('totalallOC').value = formatRupiah(totalall);
}


// Fungsi untuk mengupdate subtotal, PPN (ppnOC), dan totalallOC dengan perubahan nilai total price
function updateSubtotalWithTotalPriceChange(totalPriceChange) {
    // Mendapatkan nilai subtotalOC, PPN (ppnOC), dan totalallOC saat ini
    var subtotalOCInput = document.getElementById('subtotalOC');
    var currentSubtotalOC = parseFloat(subtotalOCInput.value.replace(/[^\d]/g, '')) || 0;

    var ppnOCInput = document.getElementById('ppnOC');
    var currentPPNOC = parseFloat(ppnOCInput.value.replace(/[^\d]/g, '')) || 0;

    var totalallOCInput = document.getElementById('totalallOC');
    var currentTotalAllOC = parseFloat(totalallOCInput.value.replace(/[^\d]/g, '')) || 0;

    // Menambahkan perubahan nilai total price dari tambahBaris ke subtotalOC
    var newSubtotalOC = currentSubtotalOC + totalPriceChange;

    // Menghitung PPN (11% dari subtotal) dan totalallOC
    var ppnRate = 0.11; // 11 persen
    var newPPNOC = newSubtotalOC * ppnRate;
    var newTotalAllOC = newSubtotalOC + newPPNOC;

    // Mengupdate nilai subtotalOC, PPN (ppnOC), dan totalallOC
    subtotalOCInput.value = formatRupiah(newSubtotalOC);
    ppnOCInput.value = formatRupiah(newPPNOC);
    totalallOCInput.value = formatRupiah(newTotalAllOC);
}

// Fungsi untuk memperbarui total price setiap kali ada perubahan pada kuantitas atau harga
function updateTotalPrice(row) {
    var qtyInput = row.querySelector('input[name="qty[]"]');
    var priceInput = row.querySelector('input[name="price[]"]');
    var totalPriceInput = row.querySelector('input[name="totalprice[]"]');
    var qty = parseFloat(qtyInput.value) || 0;
    var price = parseFloat(priceInput.value.replace(/[^\d]/g, '')) || 0;
    var totalPrice = qty * price;

    // Memanggil fungsi untuk mengupdate subtotalOC, ppnOC, dan totalallOC dengan total price yang berubah dari tambahBaris
    var previousTotalPrice = parseFloat(totalPriceInput.dataset.previousValue) || 0;
    var totalPriceChange = totalPrice - previousTotalPrice;
    updateSubtotalWithTotalPriceChange(totalPriceChange);

    // Set nilai total price menggunakan formatRupiah
    totalPriceInput.value = formatRupiah(totalPrice);
    totalPriceInput.dataset.previousValue = totalPrice;

    // Memanggil fungsi untuk menghitung subtotal, PPN, dan totalall berdasarkan dataBarang yang diperbarui
    calculateSubtotalPPNTotalAll(getDataBarang());
}

function caribarang(inputNamaBarang, selectedValue) {
    $.ajax({
        url: 'finance/caribarang.php', // Sesuaikan dengan alamat endpoint yang benar
        dataType: 'json',
        success: function(response) {
            // Kosongkan pilihan sebelum menambahkan opsi baru
            $(inputNamaBarang).empty();
            // Tambahkan opsi placeholder setelah inisialisasi Select2
            $(inputNamaBarang).append('<option value="" selected disabled>Search Item Name</option>');
            // Tambahkan opsi barang dari data yang diterima
            response.forEach(function(item) {
                var option = $('<option>', {
                    value: item.value,
                    text: item.text,
                    'data-satuan': item.satuan
                });
                $(inputNamaBarang).append(option);
            });
            // Inisialisasi Select2 setelah menambahkan opsi
            $(inputNamaBarang).select2();
            // Pilih nilai yang sebelumnya dipilih
            $(inputNamaBarang).val(selectedValue).trigger('change');

            // Tambahkan event listener untuk menanggapi perubahan pilihan
            $(inputNamaBarang).on('change', function() {
                var selectedOption = $(this).find('option:selected');
                var selectedSatuan = selectedOption.data('satuan');
                // Update nilai kolom satuan sesuai dengan pilihan barang
                var satuanInput = $(this).closest('tr').find('input[name="satuan[]"]');
                satuanInput.val(selectedSatuan);
            });
        },
        error: function(xhr, status, error) {
            console.error('Error fetching masterbarang data:', error);
        }
    });
}
