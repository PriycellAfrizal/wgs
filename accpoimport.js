
    $(document).ready(function () {
        // Inisialisasi DataTable dengan pengurutan berdasarkan status PO
        $('#dataTable').DataTable({
            "columnDefs": [
                {
                    "targets": 3, // Indeks kolom ke-4 untuk status PO
                    "orderData": [3], // Urutkan berdasarkan status PO
                    "render": function(data, type, row) {
                        // Menentukan urutan custom untuk status
                        let statusOrder = {
                            "PENDING PO": 1,
                            "APPROVED": 2,
                            "DELIVERED": 3
                        };

                        // Ubah status menjadi angka untuk tujuan pengurutan
                        return statusOrder[data] !== undefined ? statusOrder[data] : 4; // Jika status tidak diketahui, set ke angka 4
                    }
                }
            ],
            "order": [[3, 'asc']], // Urutkan berdasarkan kolom ke-4 (status PO) secara ascending
            "createdRow": function( row, data, dataIndex ) {
                // Mengubah nilai status PO kembali ke bentuk aslinya setelah pengurutan
                let statusMapping = {
                    1: "PENDING PO",
                    2: "APPROVED",
                    3: "DELIVERED"
                };

                // Temukan kolom status PO (kolom ke-4)
                let statusCell = $('td', row).eq(3);

                // Set status PO dengan nilai aslinya jika data ada di mapping, jika tidak tampilkan data mentahnya
                statusCell.text(statusMapping[data[3]] || data[3]); // Jika tidak ditemukan, tampilkan data mentah
            }
        });
    });



    
function checkPO(button) {
    const poNumber = button.getAttribute('data-nopo');
    const barangJson = button.getAttribute('data-barang');

    let barangList;
    try {
        barangList = JSON.parse(barangJson);
    } catch (e) {
        console.error("Gagal parse JSON data-barang:", barangJson);
        Swal.fire('Error!', 'Data barang tidak valid.', 'error');
        return;
    }

    console.log("📦 Barang:", barangList);
    console.log("📄 PO Number:", poNumber);

    $.ajax({
        url: '../compare_po_pricesimport.php',
        type: 'POST',
        data: {
            po_number: poNumber,
            barang: JSON.stringify(barangList)
        },
        dataType: 'json',
        success: function(compareResult) {
            console.log("✅ Compare Result:", compareResult);

            if (compareResult.length > 0) {
                let htmlMessage = `
                    <table style="width:100%; border-collapse: collapse; text-align:left;">
                        <thead>
                            <tr>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">Nama Barang</th>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">Harga Pengajuan</th>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">Harga Sebelumnya</th>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">PO Lama</th>
                                <th style="padding:6px; border-bottom:1px solid #ccc;">Perubahan</th>
                            </tr>
                        </thead>
                        <tbody>`;

              compareResult.forEach(item => {
    let arah = '';
    let warnaTeks = '';
    let warnaBackground = '';
    let perubahanText = '';

    if (item.price_baru > item.price_lama) {
        arah = 'Naik';
        warnaTeks = 'red';
        warnaBackground = '#ffecec';
        perubahanText = `Naik ${Math.abs(item.selisih).toFixed(2)}%`;
    } else if (item.price_baru < item.price_lama) {
        arah = 'Turun';
        warnaTeks = 'green';
        warnaBackground = '#e7fbe7';
        perubahanText = `Turun ${Math.abs(item.selisih).toFixed(2)}%`;
    } else {
        arah = 'Tetap';
        warnaTeks = 'blue';
        warnaBackground = '#e7f0fb';
        perubahanText = `Tidak berubah`;
    }

    htmlMessage += `
        <tr style="background-color: ${warnaBackground};">
            <td style="padding:6px;">${item.namabarang}</td>
            <td style="padding:6px;">${formatRupiah(item.price_baru)}</td>
            <td style="padding:6px;">${formatRupiah(item.price_lama)}</td>
            <td style="padding:6px;">${item.nopo_lama}</td>
            <td style="padding:6px; color:${warnaTeks}; font-weight:bold;" title="Harga ${arah}">
                ${perubahanText}
            </td>
        </tr>`;
});

                htmlMessage += `</tbody></table>`;

                Swal.fire({
                    title: 'Perbedaan Harga Ditemukan!',
                    html: htmlMessage,
                    icon: 'warning',
                    width: '800px',
                    showCancelButton: true,
                    confirmButtonText: 'Tetap ACC',
                    cancelButtonText: 'Batal'
                }).then((innerResult) => {
                    if (innerResult.isConfirmed) {
                        accPO(poNumber);
                    }
                });

            } else {
                // Tidak ada perbedaan harga
                accPO(poNumber);
            }
        },
        error: function(xhr, status, error) {
            console.error("❌ AJAX ERROR:", error);
            Swal.fire('Error!', 'Gagal membandingkan harga PO.', 'error');
        }
    });
}

function accPO(poNumber) {
    $.ajax({
        url: 'update_poimport_status.php',
        type: 'POST',
        data: {
            po_number: poNumber,
            status: 'APPROVED'
        },
        success: function(response) {
            Swal.fire('ACC PO!', `PO ${poNumber} telah di-ACC.`, 'success')
                .then(() => location.reload());
        },
        error: function(xhr, status, error) {
            console.error("❌ Update PO ERROR:", error);
            Swal.fire('Error!', 'Terjadi kesalahan saat mengupdate PO.', 'error');
        }
    });
}

function formatRupiah(number) {
    return Number(number).toLocaleString('id-ID');
}




    var modal = document.getElementById('myModal');
    var modalOpen = false; // Tambahkan variabel untuk status modal

    // Fungsi untuk menutup modal
    function closeModal() {
        modal.style.display = 'none';
        modalOpen = false; // Set modalOpen menjadi false saat modal ditutup
        console.log('Modal closed');
    }

    // Function untuk membuka modal dan mengisi dengan data terkait nopo
    function openModal(button) {
        if (modalOpen) return; // Jika modal sudah terbuka, tidak perlu membuka lagi

        var nopo = button.getAttribute('data-nopo'); // Ambil nilai atribut data-nopo dari tombol yang ditekan

        // Tampilkan modal
        modal.style.display = 'block';
        modalOpen = true; // Set modalOpen menjadi true saat modal dibuka
        console.log('Modal opened');

        // Menggunakan AJAX untuk mengambil data terkait nopo
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Parsing data JSON yang dikirim dari server
                var data = JSON.parse(this.responseText);

                // Memasukkan nilai nopo ke dalam modal
                document.getElementById('cpDisplay').innerText = data.cp;
                document.getElementById('telpDisplay').innerText = data.telp;
                document.getElementById('nopoDisplay').innerText = data.nopo;
                document.getElementById('namasuplierDisplay').innerText = data.namasuplier;
                document.getElementById('tglpoDisplay').innerText = data.tglpo;






         // Mengisi informasi barang ke dalam tabel
var tableBody = document.getElementById('barangTableBody');
tableBody.innerHTML = '';

// Isi data barang
data.barang.forEach(function(item, index) {
    var row = tableBody.insertRow();
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);

    cell1.innerText = index + 1; // Nomor urut
    cell2.innerText = item.namabarang; // Nama Barang
    cell3.innerText = item.qty + ' ' + item.satuan; // Qty dan satuan
    cell4.innerText = item.currency + ' ' + item.price; // Harga Satuan
    cell5.innerText = item.currency + ' ' + item.totalprice; // Total Harga
});


// Tambahkan baris Local Charge (jika ada dan tidak nol)
if (data.bankcharge && parseFloat(data.bankcharge.replace('.', '').replace(',', '.')) !== 0) {

    var bankRow = tableBody.insertRow();

    // Gabungkan 3 kolom pertama (No, Nama Barang, dan lainnya)
    var descCell = bankRow.insertCell(); // Kolom gabungan
    descCell.colSpan = 4;
    descCell.innerHTML = '<style="display: block; text-align: center;">Bank Charge</>';

    // Kolom 4: jumlah
    var amountCell = bankRow.insertCell(); // Kolom 4
    amountCell.innerText = data.currency + ' ' + data.bankcharge;
}





// Tambahkan baris Local Charge (jika ada dan tidak nol)
if (data.shippingcharge && parseFloat(data.shippingcharge.replace('.', '').replace(',', '.')) !== 0) {



    var shipRow = tableBody.insertRow();

    // Gabungkan 3 kolom pertama (No, Nama Barang, dan lainnya)
    var descCell2 = shipRow.insertCell(); // Kolom gabungan
    descCell2.colSpan = 4;
    descCell2.innerHTML = '<style="display: block; text-align: center;">Shipping Charge</>';

    // Kolom 4: jumlah
    var amountCell2 = shipRow.insertCell(); // Kolom 4
    amountCell2.innerText = data.currency + ' ' + data.shippingcharge;
}

// Tambahkan baris Local Charge (jika ada dan tidak nol)
if (data.localcharge && parseFloat(data.localcharge.replace('.', '').replace(',', '.')) !== 0) {

    var localRow = tableBody.insertRow();

    // Gabungkan 4 kolom pertama (No, Nama Barang, dan lainnya)
    var descCell3 = localRow.insertCell(); // Kolom gabungan
    descCell3.colSpan = 4;
    descCell3.innerHTML = '<strong style="display: block; text-align: center;">Local Charge</strong>';

    var amountCell3 = localRow.insertCell(); // Kolom jumlah
    amountCell3.innerText = data.currency + ' ' + data.localcharge;
}





// Tambahkan baris Local Charge (jika ada dan tidak nol)
if (data.packingcharge && parseFloat(data.packingcharge.replace('.', '').replace(',', '.')) !== 0) {


    var packingRow = tableBody.insertRow();

    // Gabungkan 4 kolom pertama (No, Nama Barang, dan lainnya)
    var descCell4 = packingRow.insertCell(); // Kolom gabungan
    descCell4.colSpan = 4;
    descCell4.innerHTML = '<style="display: block; text-align: center;">Packing Charge</>';

    var amountCell4= packingRow.insertCell(); // <- Ini sekarang benar
    amountCell4.innerText = data.currency + ' ' + data.packingcharge;
}




// Tambahkan baris Local Charge (jika ada dan tidak nol)
if (data.ciffcharge && parseFloat(data.ciffcharge.replace('.', '').replace(',', '.')) !== 0) {


    var cifRow = tableBody.insertRow();

    // Gabungkan 4 kolom pertama (No, Nama Barang, dan lainnya)
    var descCell5 = cifRow.insertCell(); // Kolom gabungan
    descCell5.colSpan = 4;
    descCell5.innerHTML = '<style="display: block; text-align: center;">Ciff Charge</>';

    var amountCell5= cifRow.insertCell(); // <- Ini sekarang benar
    amountCell5.innerText = data.currency + ' ' + data.cifcharge;
}




// Tambahkan baris Local Charge (jika ada dan tidak nol)
if (data.insurancecharge && parseFloat(data.insurancecharge.replace('.', '').replace(',', '.')) !== 0) {


    var insuranceRow = tableBody.insertRow();

    // Gabungkan 4 kolom pertama (No, Nama Barang, dan lainnya)
    var descCell6 = insuranceRow.insertCell(); // Kolom gabungan
    descCell6.colSpan = 4;
    descCell6.innerHTML = '<style="display: block; text-align: center;">Insurance Charge</>';

    var amountCell6= insuranceRow.insertCell(); // <- Ini sekarang benar
    amountCell6.innerText = data.currency + ' ' + data.insurancecharge;
}




// Tambahkan baris Local Charge (jika ada)
if (data.totalall) {
    var totalallRow = tableBody.insertRow();

    // Gabungkan 4 kolom pertama (No, Nama Barang, dan lainnya)
    var descCell7 = totalallRow.insertCell(); // Kolom gabungan
    descCell7.colSpan = 4;
    descCell7.innerHTML = '<strong style="display: block; text-align: center;">Grand Total : </strong>';

    var amountCell7= totalallRow.insertCell(); // <- Ini sekarang benar
    amountCell7.innerText = data.currency + ' ' + data.totalall;
}













                  

                // Memasukkan data posuratjalan ke dalam tabel
                var sjTableBody = document.getElementById('suratjalanTableBody');
                sjTableBody.innerHTML = '';
                if (data.posuratjalan) {
                    data.posuratjalan.forEach(function(sjItem, index) {
                        var sjRow = sjTableBody.insertRow();
                        var cell1 = sjRow.insertCell(0);
                        var cell2 = sjRow.insertCell(1);
                        var cell3 = sjRow.insertCell(2);
                        var cell4 = sjRow.insertCell(3);
                        var cell5 = sjRow.insertCell(4);
                        var cell6 = sjRow.insertCell(5); // Tambahkan cell untuk nomor urut

                        cell1.innerText = index + 1; // Nomor urut
                        cell2.innerText = sjItem.nosuratjalan;
                        cell3.innerText = sjItem.tglsj;
                        cell4.innerText = sjItem.namabarang;
                        cell5.innerText = sjItem.qty;
                        cell6.innerText = sjItem.nosp;
                    });
                }
            }
        };
        // Ganti URL berikut dengan URL yang sesuai untuk mengambil data PO berdasarkan nopo
        xhttp.open("GET", "endpoint/get_Historypoimport.php?nopo=" + nopo, true);
        xhttp.send();
    }

    document.addEventListener('mousedown', function(event) {
    if (modalOpen && !modal.contains(event.target)) {
        closeModal();
        console.log('Clicked outside modal');
    }
});

function printDocument(nopo) {
    // Misalkan Anda ingin mencetak halaman dengan URL tertentu
    var printUrl = "endpoint/printpagepoimport.php?nopo=" + nopo;
    
    // Buka jendela baru untuk halaman cetak
    var printWindow = window.open(printUrl, '_blank');
    
    // Tunggu hingga halaman selesai dimuat
    printWindow.onload = function() {
        // Cetak halaman
        printWindow.print();
        
        // Tutup jendela setelah mencetak
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}
