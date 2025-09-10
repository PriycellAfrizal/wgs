$(document).ready(function () {
    $('#dataOC').DataTable(); // ID From dataTable
});

function formatRupiah(angka) {
    var number_string = angka.replace(/[^,\d]/g, '').toString();
    var split = number_string.split(',');
    var sisa = split[0].length % 3;
    var rupiah = split[0].substr(0, sisa);
    var ribuan = split[0].substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        var separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah;
}

function parseRupiah(angka) {
    // Remove 'Rp ' prefix and non-numeric characters except for commas
    var number_string = angka.replace(/[^,\d]/g, '').toString();
    return parseFloat(number_string.replace(',', '.')) || 0;
}



// Fetch total previous payments from the server
function fetchTotalPembayaran(oc, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'finance/get_total_pembayaran_invoice.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 400) {
            var responseText = xhr.responseText.trim();
            console.log('Raw Response:', responseText);  // Debugging
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

// Validate and calculate payment
function validateAndCalculatePembayaran() {
    var subtotal = parseRupiah(document.getElementById('subtotalawal').value);
    var jumlahPembayaran = parseRupiah(document.getElementById('jumlahpembayaran').value);
    var ppnPembayaran = parseRupiah(document.getElementById('ppnpembayaran').value); // User input PPN
    var pph = parseRupiah(document.getElementById('pph').value);
    var oc = document.getElementById('ocOC').value;

    console.log("Subtotal: ", subtotal);
    console.log("Jumlah Pembayaran: ", jumlahPembayaran);

    // If jumlahPembayaran is empty, reset total payment
    if (isNaN(jumlahPembayaran) || jumlahPembayaran === null || jumlahPembayaran === '') {
        var totalAllPembayaran = 0;
        document.getElementById('ppnpembayaran').value = formatRupiah(0);
        document.getElementById('totalallpembayaran').value = formatRupiah(totalAllPembayaran);
        return;
    }

    // If PPN is empty or 0, don't apply PPN, otherwise, use the provided PPN value
    if (isNaN(ppnPembayaran) || ppnPembayaran === 0) {
        ppnPembayaran = 0;  // Set PPN to 0 if not provided
    }

    // Calculate total payment (including PPN and pph)
    var totalAllPembayaran = jumlahPembayaran + ppnPembayaran - pph;

    // Update fields
    document.getElementById('ppnpembayaran').value = formatRupiah(ppnPembayaran.toFixed(0)); // Format the PPN
    document.getElementById('totalallpembayaran').value = formatRupiah(totalAllPembayaran.toFixed(0)); // Format total payment
}






// Handling percentage input and updating payment amount
function updatePembayaranFromPersentase(e) {
    var persentase = parseFloat(e.target.value);
    var subtotal = parseRupiah(document.getElementById('subtotalOC').value);
    var oc = document.getElementById('ocOC').value;

    if (!isNaN(persentase) && !isNaN(subtotal)) {
        var jumlahPembayaran = (persentase / 100) * subtotal;
        document.getElementById('jumlahpembayaran').value = formatRupiah(jumlahPembayaran.toFixed(0));

        validateAndCalculatePembayaran();

        // Ambil total pembayaran sebelumnya
        fetchTotalPembayaran(oc, function(totalPembayaran) {
            var sisaPembayaran = subtotal - totalPembayaran;
            console.log("Total Pembayaran Sebelumnya: ", totalPembayaran);
            console.log("Sisa Pembayaran: ", sisaPembayaran);

            var formattedSisaPembayaran = formatRupiah(sisaPembayaran.toFixed(0));

            // Hitung persentase sisa pembayaran terhadap subtotal
            var persentaseSisaPembayaran = (sisaPembayaran / subtotal) * 100;
            var formattedPersentase = persentaseSisaPembayaran.toFixed(2); // Format persentase dengan dua desimal

            if (jumlahPembayaran > sisaPembayaran) {
                alert('Maximal Pembayaran DPP hanya bisa ' + formattedSisaPembayaran + ' atau ' + formattedPersentase + '% dari subtotal.');
                document.getElementById('jumlahpembayaran').value = '';
                document.getElementById('ppnpembayaran').value = '';
                document.getElementById('totalallpembayaran').value = '';
                return;
            }

            // Hitung PPN dan Total Keseluruhan Pembayaran
            var ppnPembayaran = jumlahPembayaran * 0.11; // Default PPN 11% if no PPN input
            var totalAllPembayaran = jumlahPembayaran + ppnPembayaran;

            document.getElementById('ppnpembayaran').value = formatRupiah(ppnPembayaran.toFixed(0));
            document.getElementById('totalallpembayaran').value = formatRupiah(totalAllPembayaran.toFixed(0));
        });
    }
}

// Event listeners for input changes
document.getElementById('jumlahpembayaran').addEventListener('input', validateAndCalculatePembayaran);
document.getElementById('ppnpembayaran').addEventListener('input', validateAndCalculatePembayaran);
document.getElementById('pph').addEventListener('input', validateAndCalculatePembayaran);

// Menambahkan event listener untuk input PPN
document.getElementById('ppnpembayaran').addEventListener('input', function() {
    validateAndCalculatePembayaran();
});

// Menambahkan event listener untuk persentase pembayaran
document.getElementById('persentasepembayaran').addEventListener('input', updatePembayaranFromPersentase);












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

                xhr.open('GET', 'finance/get_barang.php?oc=' + encodeURIComponent(oc), true);
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





            // document.getElementById("statusDisplay").textContent = barang[0].status; // Ubah sesuai struktur JSON yang diterima
            // document.getElementById("salesDisplay").textContent = barang[0].sales; // Ubah sesuai struktur JSON yang diterima
            document.getElementById("tglquotesDisplay").textContent = barang[0].tgloc; // Ubah sesuai struktur JSON yang diterima
          

            modal.style.display = "block";
        }
    });







function openModalOC(id) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var dataInfo = JSON.parse(xhr.responseText);

                document.getElementById("namacustomerOC").value = dataInfo.namacustomer;

                document.getElementById("idOC").value = dataInfo.id;

                document.getElementById("noinvoiceOC").value = dataInfo.noinvoice;
                document.getElementById("ocOC").value = dataInfo.oc;


                document.getElementById("subtotalawal").value = dataInfo.jumlahpembayaran;

                document.getElementById("subtotalOC").value = dataInfo.jumlahpembayaran;
                document.getElementById("ppnOC").value = dataInfo.ppn;
                document.getElementById("totalallOC").value = dataInfo.totalall;

                showDetails(dataInfo.dataBarangOC);
            } else {
                alert("Failed to fetch information.");
            }
        }
    };

    xhr.open('GET', 'finance/get_data_invoice.php?id=' + encodeURIComponent(id), true);
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
