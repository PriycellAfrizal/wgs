 $(document).ready(function () {
    $('#dataTable').DataTable({
        "order": [
            [5, 'asc'], // Order by the 'status' column in ascending order
        ],
        "columnDefs": [
            {
                "targets": [5], // Target the 'status' column
                "orderData": [5], // Use the 'status' column for ordering
                "render": function (data, type, row) {
                    // Define custom ordering based on your status values
                    switch (data) {
                        case 'PENDING APPROVAL':
                            return 5;
                        case 'APPROVED':
                            return 4;
                        case 'PENDING OC APPROVAL':
                            return 1;
                        case 'OC APPROVED':
                            return 2;
                        case 'SPK ISSUED':
                            return 3;
                        default:
                            return 6;
                    }
                }
            }
        ],

        "createdRow": function (row, data, dataIndex) {
            // Add a data attribute to store the original status for display
            $(row).attr('data-original-status', data[5]);
        },
        "drawCallback": function () {
            // Update the display of the status column after DataTables has been drawn
            $('#dataTable tbody tr').each(function () {
                var originalStatus = $(this).data('original-status');
                $(this).find('td:eq(5)').text(originalStatus);
            });
        }
    });
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

        span.onclick = function() {
            modal.style.display = "none";
        };

           window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }



// Deklarasikan variabel infoButtons
var infoButtons = document.querySelectorAll('.infoButton'); // pastikan tombol memiliki kelas 'infoButton'

// Menambahkan event listener untuk tombol informasi
infoButtons.forEach(function(button) {
    button.addEventListener('click', function(event) {
        event.preventDefault();
        var oc = this.dataset.oc;

        modal.style.display = 'block';
        modalOpen = true; // Set modalOpen menjadi true saat modal dibuka
        console.log('Modal opened');


        // Kirim permintaan AJAX ke PHP untuk mengambil data barang
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var data = JSON.parse(xhr.responseText);
                    showDetails(data.barang); // Tampilkan data barang
                } else {
                    alert("Gagal mengambil data dari server.");
                }
            }
        };

        xhr.open('GET', 'get_barangoc.php?oc=' + encodeURIComponent(oc), true);
        xhr.send();
    });
});

function showDetails(barang) {
    document.getElementById("barangTableBody").innerHTML = "";
    document.getElementById("spkTableBody").innerHTML = "";
    document.getElementById("PenagihanTableBody").innerHTML = "";

    barang.forEach(function(item) {
        var nomor = 1;
        var namabarangList = item.namabarang ? item.namabarang.split("<br>") : [];
        var qtyList = item.qty ? item.qty.split("<br>") : [];
        var satuanList = item.satuan ? item.satuan.split("<br>") : [];
        var priceList = item.price ? item.price.split("<br>") : [];
        var discountList = item.discount ? item.discount.split("<br>") : [];
        var totalpriceList = item.totalprice ? item.totalprice.split("<br>") : [];
        var customerList = item.namacustomer ? item.namacustomer.split("<br>") : [];
        var ocList = item.oc ? item.oc.split("<br>") : [];

        for (var i = 0; i < namabarangList.length; i++) {
            var row = document.createElement("tr");

            // Add hyperlink to namabarang to open modal
            var namabarangLink = "<a href='#' onclick='openNamabarangOCModal(\"" + namabarangList[i] + "\", \"" + qtyList[i] + "\", \"" + satuanList[i] + "\", \"" + customerList[i] + "\", \"" + ocList[i] + "\")'>" + namabarangList[i] + "</a>";

            row.innerHTML = "<td>" + (nomor++) + "</td>" +
                            "<td>" + namabarangLink + "</td>" +
                            "<td>" + qtyList[i] + "</td>" +
                            "<td>" + satuanList[i] + "</td>" +
                            "<td>" + priceList[i] + "</td>" +
                            "<td>" + discountList[i] + "</td>" +
                            "<td>" + totalpriceList[i] + "</td>";
            document.getElementById("barangTableBody").appendChild(row);
        }
    });


    // Perulangan untuk menampilkan data dari tabel SPK
    barang.forEach(function(item) {
        var nomor = 1; // Nomor awal untuk perulangan spk
        // Check if data exists before calling .split()
        var namabarangspkList = item.namabarangspk ? item.namabarangspk.split("<br>") : [];
        var qtyspkList = item.qtyspk ? item.qtyspk.split("<br>") : [];
        var satuanspkList = item.satuanspk ? item.satuanspk.split("<br>") : [];
        var spkspkList = item.spkspk ? item.spkspk.split("<br>") : [];
        var kodeproduksiList = item.kodeproduksi ? item.kodeproduksi.split("<br>") : [];
        var finishingList = item.finishing ? item.finishing.split("<br>") : [];
        var tglsuratjalanList = item.tglsuratjalan ? item.tglsuratjalan.split("<br>") : [];
        var nomorsuratjalanList = item.nomorsuratjalan ? item.nomorsuratjalan.split("<br>") : [];

        // Loop through the individual items in SPK
        for (var i = 0; i < namabarangspkList.length; i++) {
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + (nomor++) + "</td>" +
                            "<td>" + namabarangspkList[i] + "</td>" +
                            "<td>" + qtyspkList[i] + "</td>" +
                            "<td>" + satuanspkList[i] + "</td>" +
                            "<td>" + spkspkList[i] + "</td>" +
                            "<td>" + kodeproduksiList[i] + "</td>" +
                            "<td>" + finishingList[i] + "</td>" +
                            "<td>" + tglsuratjalanList[i] + "</td>" +
                            "<td>" + nomorsuratjalanList[i] + "</td>";
            document.getElementById("spkTableBody").appendChild(row);
        }
    });



    // Perulangan untuk menampilkan data penagihan
    barang.forEach(function(item) {
        var nomor = 1; // Nomor awal untuk perulangan penagihan
        // Check if data exists before calling .split()
        var idpenagihanList = item.idpenagihan ? item.idpenagihan.split("<br>") : [];
        var tglpenagihanList = item.tglpenagihan ? item.tglpenagihan.split("<br>") : [];
        var namabarangpenagihanList = item.namabarangpenagihan ? item.namabarangpenagihan.split("<br>") : [];
        var jumlahpenagihanList = item.jumlahpenagihan ? item.jumlahpenagihan.split("<br>") : [];
        var tglpembayaranList = item.tglpembayaran ? item.tglpembayaran.split("<br>") : [];
        var jumlahpembayaranList = item.jumlahpembayaran ? item.jumlahpembayaran.split("<br>") : [];

        var noinvoicepenagihanList = item.noinvoicepenagihan ? item.noinvoicepenagihan.split("<br>") : [];



        // Loop through the individual items in Penagihan
        for (var i = 0; i < idpenagihanList.length; i++) {
            var row = document.createElement("tr");
            row.innerHTML = "<td>" + (nomor++) + "</td>" +

                            "<td>" + namabarangpenagihanList[i] + "</td>" +

                            "<td>" + tglpenagihanList[i] + "</td>" +
                            
                            "<td>" + noinvoicepenagihanList[i] + "</td>" +

                            "<td>" + jumlahpenagihanList[i] + "</td>" +
                            "<td>" + tglpembayaranList[i] + "</td>" +
                            "<td>" + jumlahpembayaranList[i] + "</td>";
            document.getElementById("PenagihanTableBody").appendChild(row);
        }
    });

    // Tampilkan informasi lainnya (misalnya notes dan total)
    var notes = barang[0].notes || "";
    var lines = notes.split('\n');
    var formattedNotes = lines.map(line => " " + line.trim()).join('<br>');
    document.getElementById("notesDisplay").innerHTML = formattedNotes;

    document.getElementById("ocDisplay").textContent = barang[0].oc;
    document.getElementById("subtotalDisplay").textContent = barang[0].subtotal;
    document.getElementById("tglocDisplay").textContent = barang[0].tgloc;
    document.getElementById("ppnDisplay").textContent = barang[0].ppn;
    document.getElementById("totalallDisplay").textContent = barang[0].totalall;
    document.getElementById("namacustomerDisplay").textContent = barang[0].namacustomer;
    document.getElementById("alamatDisplay").textContent = barang[0].alamat;

    modal.style.display = "block"; // Tampilkan modal dengan data barang
}


    });
        



function updateStatusOC(oc) {
    Swal.fire({
        title: `Apakah Yakin Ingin Menyetujui OC ${oc}?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Sedang Mengirim Email OC ...',
                text: 'Harap tunggu sebentar.',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            $.ajax({
                url: 'update_statusoc.php', // Pastikan URL ini sesuai dengan file PHP Anda
                type: 'POST',
                data: {
                    oc: oc
                },
                success: function(response) {
                    Swal.close(); // Menutup notifikasi "Sedang Mengirim Email"

                    if (response.trim() === 'Email Sent') {
                        Swal.fire({
                            icon: 'success',
                            title: `OC ${oc} berhasil dikirim kepada Customer`,
                            text: 'Email berhasil dikirim.',
                            showConfirmButton: false,
                            timer: 5000 // Menampilkan pesan selama 5 detik
                        }).then(function() {
                            window.location.reload();

                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal',
                            text: response
                        });
                    }
                },
                error: function(xhr, status, error) {
                    console.error(xhr.responseText);
                    Swal.close(); // Menutup notifikasi "Sedang Mengirim Email"

                    Swal.fire({
                        icon: 'error',
                        title: 'Kesalahan AJAX',
                        text: 'Terjadi kesalahan saat mengirim permintaan AJAX.'
                    });
                }
            });
        }
    });
}
