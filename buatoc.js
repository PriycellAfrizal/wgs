$(document).ready(function () {
    $('#dataOC').DataTable(); // ID From dataTable
});



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

document.addEventListener("DOMContentLoaded", function() {
    var modal = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    var infoButtons = document.querySelectorAll('.infoButton'); // Mengganti editButtons menjadi infoButtons

    infoButtons.forEach(function(button) {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            var quotes = this.dataset.quotes;

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

            xhr.open('GET', 'marketing/get_barang.php?quotes=' + encodeURIComponent(quotes), true);
            xhr.send();
        });
    });

    function showDetails(barang) {
        // Bersihkan isi tabel sebelum menambahkan data baru
        document.getElementById("barangTableBody").innerHTML = "";

        var nomor = 1; // Nomor awal

        // Tambahkan data barang ke dalam tabel
        barang.forEach(function(item) {
            // Menentukan nilai discount
            var discount = item.discount ? item.discount : "Rp 0";
            
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + nomor++ + "</td>" +
                            "<td>" + item.namabarang + "</td>" +
                            "<td>" + item.qty + "</td>" +
                            "<td>" + item.satuan + "</td>" +
                            "<td>" + item.price + "</td>" +
                            "<td>" + discount + "</td>" +
                            "<td>" + item.totalprice + "</td>";
            document.getElementById("barangTableBody").appendChild(row);
        });

        // Set nilai quotesDisplay dan salesDisplay
        document.getElementById("quotesDisplay").textContent = barang[0].quotes;
        document.getElementById("namacustomerDisplay").textContent = barang[0].namacustomer;
        document.getElementById("cpDisplay").textContent = barang[0].cp;
        document.getElementById("alamatDisplay").textContent = barang[0].alamat;

        // Proses dan tampilkan notes dengan setiap baris diawali tanda *
        var notes = barang[0].notes || ""; // Pastikan notes ada atau berikan string kosong
        var lines = notes.split('\n'); // Pecah teks menjadi baris-baris
        var formattedNotes = lines.map(line => " " + line.trim()).join('<br>'); // Tambahkan * di awal setiap baris dan gabungkan kembali dengan <br>
        document.getElementById("notesDisplay").innerHTML = formattedNotes; // Gunakan innerHTML agar format asli tetap terjaga

       document.getElementById("statusDisplay").textContent = barang[0].status; // Ubah sesuai struktur JSON yang diterima

         // Menyembunyikan gambar jika statusDisplay adalah "PENDING APPROVAL"
    if (barang[0].status === "PENDING APPROVAL") {
        document.getElementById("logo").style.display = "none"; // Sembunyikan gambar
    } else {
        document.getElementById("logo").style.display = "block"; // Tampilkan gambar
    }


        document.getElementById("subtotalDisplay").textContent = barang[0].subtotal;
        document.getElementById("tglquotesDisplay").textContent = barang[0].tglquotes;
        document.getElementById("ppnDisplay").textContent = barang[0].ppn;
        document.getElementById("totalallDisplay").textContent = barang[0].totalall;

        // Tampilkan modal
        modal.style.display = "block";
    }

    // Tutup modal saat tombol X ditekan
    span.addEventListener('click', function() {
        modal.style.display = "none";
    });

    // Tutup modal saat klik di luar modal
    window.addEventListener('click', function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
});



   // Fungsi untuk menginisialisasi konten dari dataInfo.notes
function initializeNotes() {
    const notesDiv = document.getElementById('notesOC');
    // Memastikan notesDiv memiliki format yang benar
    ensureStartingCharacter();
}

// Fungsi untuk mengisi data pada modal dan mengupdate notesOC
function openModalOC(quotes) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var dataInfo = JSON.parse(xhr.responseText);

                document.getElementById("QuotesInput").value = quotes;
                document.getElementById("cpOC").value = dataInfo.cp;
                document.getElementById("cpOCDisplay").textContent = dataInfo.cp;
                document.getElementById("salesOC").value = dataInfo.sales;
                document.getElementById("salesOCDisplay").textContent = dataInfo.sales;
                document.getElementById("namacustomerOC").value = dataInfo.namacustomer;
                document.getElementById("namacustomerOCDisplay").textContent = dataInfo.namacustomer;

                // Mengisi notesOC dengan konten yang benar
                const notesDiv = document.getElementById('notesOC');
                notesDiv.innerHTML = dataInfo.notes; // Memuat data dari variabel
                ensureStartingCharacter();

                document.getElementById("subtotalOC").value = dataInfo.subtotal;
                document.getElementById("ppnOC").value = dataInfo.ppn;
                document.getElementById("totalallOC").value = dataInfo.totalall;
                document.getElementById("emailOC").value = dataInfo.email;
                document.getElementById("emailOCDisplay").textContent = dataInfo.email;
                document.getElementById("alamatOC").value = dataInfo.alamat;
                document.getElementById("alamatOCDisplay").textContent = dataInfo.alamat;

                showDetails(dataInfo.dataBarangOC);
            } else {
                alert("Failed to fetch information.");
            }
        }
    };

    xhr.open('GET', 'marketing/get_data_quotes.php?quotes=' + encodeURIComponent(quotes), true);
    xhr.send();

    var modalOC = document.getElementById("ModalOC");
    modalOC.style.display = "flex";

    window.addEventListener('click', function(event) {
        if (event.target == modalOC) {
            closeModalOC();
        }
    });
}


    document.getElementById('notesoc').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();  // Mencegah Enter default
            document.execCommand('insertText', false, '\n* ');
        }
    });

    document.addEventListener("DOMContentLoaded", function() {
        document.getElementById('notesoc').textContent = '* ';

    updateTextarea(); // Memperbarui nilai textarea
    });


// Fungsi untuk memperbarui nilai textarea dengan konten dari notesOC
function updateTextarea() {
    const notesDiv = document.getElementById('notesOC');
    const notesTextarea = document.getElementById('notesTextarea');
    notesTextarea.value = notesDiv.innerHTML; // Memperbarui nilai textarea
}

// Event listener untuk memperbarui textarea saat ada perubahan
document.getElementById('notesOC').addEventListener('input', function() {
    updateTextarea();
});



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
        inputQty.addEventListener("input", function() {
            barang.qty = this.value;
            updateTotalPrice(row, dataBarang, i);
        });
        inputQty.style.width = "60px";
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
        inputPrice.value = formatRupiah(barang.price);
        inputPrice.addEventListener("input", function() {
            var numericValue = this.value.replace(/[^\d]/g, ''); // Hanya angka
            barang.price = parseFloat(numericValue) || 0;
            this.value = formatRupiah(barang.price);
            updateTotalPrice(row, dataBarang, i);
        });
        cell4.appendChild(inputPrice);


        var cell5 = row.insertCell(4);
        var inputDiscount = document.createElement("input");
        inputDiscount.type = "text";
        inputDiscount.name = "discount[]";
        inputDiscount.value = formatRupiah(barang.discount || 0);
        inputDiscount.addEventListener("input", function() {
            var numericValue = this.value.replace(/[^\d]/g, ''); // Hanya angka
            barang.discount = parseFloat(numericValue) || 0;
            this.value = formatRupiah(barang.discount);
            updateTotalPrice(row, dataBarang, i);
        });
        cell5.appendChild(inputDiscount);



        var cell6 = row.insertCell(5);
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
            updateTotalPrice(row, dataBarang, i);
        });
        cell6.appendChild(inputTotalPrice);


        // Kolom Aksi
        var cell7 = row.insertCell(6);
        var deleteButton = document.createElement("button");
        deleteButton.textContent = "Hapus";
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.style.color = "white";
        deleteButton.addEventListener("click", function() {
            tableBody.deleteRow(row.rowIndex - 1);
            calculateSubtotalPPNTotalAll(getDataBarang());
        });
        cell7.appendChild(deleteButton);
    });
}



function updateTotalPrice(row, dataBarang, i) {
    var qty = parseFloat(row.querySelector('td:nth-child(2) input').value);
    var priceInput = row.querySelector('td:nth-child(4) input');
    var priceValue = priceInput.value.replace(/[^\d]/g, '');
    var price = parseFloat(priceValue) || 0;

    var discountInput = row.querySelector('td:nth-child(5) input');
    var discountValue = discountInput.value.replace(/[^\d]/g, '');
    var discount = parseFloat(discountValue) || 0;

    // Hitung total harga setelah diskon
    var totalprice = qty * price - discount;

    // Perbarui input total price dengan format Rupiah
    var totalpriceInput = row.querySelector('td:nth-child(6) input');
    totalpriceInput.value = formatRupiah(totalprice);
    totalpriceInput.dataset.previousValue = totalprice;

    // Perbarui data barang untuk baris ini
    dataBarang[i].qty = qty;
    dataBarang[i].price = price;
    dataBarang[i].discount = discount;
    dataBarang[i].totalprice = totalprice;

    // Perbarui total perhitungan seluruh baris
    calculateSubtotalPPNTotalAll(getDataBarang()); // Ambil ulang semua data untuk perhitungan yang akurat
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

        var discountInput = row.querySelector('td:nth-child(5) input');
        var discountValue = discountInput.value.replace(/[^\d.]/g, '');
        var discount = parseFloat(discountValue.replace(/\./g, '')) || 0;

        var totalpriceInput = row.querySelector('td:nth-child(6) input');
        var totalpriceValue = totalpriceInput.value.replace(/[^\d.]/g, '');
        var totalprice = parseFloat(totalpriceValue.replace(/\./g, '')) || 0;

        dataBarang.push({
            namabarang: namabarang,
            qty: qty,
            satuan: satuan,
            price: price,
            discount: discount,
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
    var rowIndex = tableBody.rows.length;
    var row = tableBody.insertRow(rowIndex);

    var dataBarang = getDataBarang(); // Ambil data barang saat ini

    var cell1 = row.insertCell(0);
    var inputNamaBarang = document.createElement("select");
    inputNamaBarang.name = "namabarang[]";
    inputNamaBarang.classList.add("itemnamebaru");
    inputNamaBarang.style.width = "300px";
    inputNamaBarang.style.border = "none";
    caribarang(inputNamaBarang, ''); // Biarkan kosong untuk baris baru
    cell1.appendChild(inputNamaBarang);

    var cell2 = row.insertCell(1);
    var inputQty = document.createElement("input");
    inputQty.type = "number";
    inputQty.name = "qty[]";
    inputQty.min = "1";
    inputQty.value = 1; // Default ke 1
    inputQty.addEventListener("input", function() {
        updateTotalPrice(row, dataBarang, rowIndex);
    });
    inputQty.style.width = "60px";
    cell2.appendChild(inputQty);

    var cell3 = row.insertCell(2);
    var inputSatuan = document.createElement("input");
    inputSatuan.type = "text";
    inputSatuan.name = "satuan[]";
    inputSatuan.value = ''; // Kosong untuk baris baru
    inputSatuan.readOnly = true;
    inputSatuan.style.width = "90px";
    inputSatuan.style.border = "none";
    cell3.appendChild(inputSatuan);

    var cell4 = row.insertCell(3);
    var inputPrice = document.createElement("input");
    inputPrice.type = "text";
    inputPrice.name = "price[]";
    inputPrice.value = ''; // Kosong untuk baris baru
    inputPrice.addEventListener("input", function() {
        var numericValue = this.value.replace(/[^\d]/g, '');
        this.value = formatRupiah(parseFloat(numericValue) || 0);
        updateTotalPrice(row, dataBarang, rowIndex);
    });
    cell4.appendChild(inputPrice);


    var cell5 = row.insertCell(4);
    var inputDiscount = document.createElement("input");
    inputDiscount.type = "text";
    inputDiscount.name = "discount[]";
    inputDiscount.value = formatRupiah(0); // Default ke 0
    inputDiscount.addEventListener("input", function() {
        var numericValue = this.value.replace(/[^\d]/g, '');
        this.value = formatRupiah(parseFloat(numericValue) || 0);
        updateTotalPrice(row, dataBarang, rowIndex);
    });
    cell5.appendChild(inputDiscount);



    var cell6 = row.insertCell(5);
    var inputTotalPrice = document.createElement("input");
    inputTotalPrice.type = "text";
    inputTotalPrice.name = "totalprice[]";
    inputTotalPrice.value = formatRupiah(0); // Default ke 0
    inputTotalPrice.readOnly = true;
    inputTotalPrice.style.border = "none";
    inputTotalPrice.dataset.previousValue = 0; // Default ke 0
    cell6.appendChild(inputTotalPrice);



    // Kolom Aksi
    var cell7 = row.insertCell(6);
    var deleteButton = document.createElement("button");
    deleteButton.textContent = "Hapus";
    deleteButton.classList.add("btn", "btn-danger");
    deleteButton.style.color = "white";
    deleteButton.addEventListener("click", function() {
        tableBody.deleteRow(row.rowIndex - 1);
        calculateSubtotalPPNTotalAll(getDataBarang());
    });
    cell7.appendChild(deleteButton);

    // Tambahkan data baru ke array dataBarang
    dataBarang.push({
        namabarang: '',
        qty: 1,
        satuan: '',
        price: 0,
        discount: 0,
        totalprice: 0
    });

    // Update total setelah baris baru ditambahkan
    calculateSubtotalPPNTotalAll(dataBarang);
}


function getDataBarang() {
    var rows = document.querySelectorAll("#dataocBody tr");
    var dataBarang = [];

    rows.forEach(function(row) {
        var namabarangElem = row.querySelector('td:nth-child(1) select');
        var qtyElem = row.querySelector('td:nth-child(2) input');
        var satuanElem = row.querySelector('td:nth-child(3) input');
        var priceElem = row.querySelector('td:nth-child(4) input');

        var discountElem = row.querySelector('td:nth-child(5) input');

        var totalpriceElem = row.querySelector('td:nth-child(6) input');
        
        if (namabarangElem && qtyElem && satuanElem && priceElem && discountElem && totalpriceElem) {
            var namabarang = namabarangElem.value;
            var qty = parseFloat(qtyElem.value) || 0;
            var satuan = satuanElem.value;


            var priceValue = priceElem.value.replace(/[^\d]/g, '');
            var price = parseFloat(priceValue) || 0;



            var discountValue = discountElem.value.replace(/[^\d]/g, '');
            var discount = parseFloat(discountValue) || 0;



            var totalpriceValue = totalpriceElem.value.replace(/[^\d]/g, '');
            var totalprice = parseFloat(totalpriceValue) || 0;

            dataBarang.push({
                namabarang: namabarang,
                qty: qty,
                satuan: satuan,
                price: price,
                discount : discount,
                totalprice: totalprice
            });
        }
    });

    return dataBarang;
}







function caribarang(inputNamaBarang, selectedValue) {
    $.ajax({
        url: 'marketing/get_data_oc.php', // Sesuaikan dengan alamat endpoint yang benar
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
