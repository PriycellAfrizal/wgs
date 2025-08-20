      $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 

        $('#dataTableHover').DataTable(); // ID From dataTable with Hover


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
                    showDetails(data.barang, data.penagihan, data.pembayaran); // Tampilkan data barang
                } else {
                    alert("Gagal mengambil data dari server.");
                }
            }
        };

        xhr.open('GET', 'marketing/get_barangoc.php?oc=' + encodeURIComponent(oc), true);
        xhr.send();
    });
});


function showDetails(barang, penagihan, pembayaran) {
    document.getElementById("barangTableBody").innerHTML = "";

    var nomor = 1;
    barang.forEach(function(item) {
        var row = document.createElement("tr");
        row.innerHTML =
            "<td>" + (nomor++) + "</td>" +
            "<td>" + (item.namabarang || '') + "</td>" +
            "<td>" + (item.qty || '') + "</td>" +
            "<td>" + (item.satuan || '') + "</td>" +
            "<td>" + (item.price || '') + "</td>" +
            "<td>" + (item.discount || '') + "</td>" +
            "<td>" + (item.totalprice || '') + "</td>";
        document.getElementById("barangTableBody").appendChild(row);
    });

    // Tampilkan info lainnya hanya sekali, misalnya pakai data dari barang[0]
    if (barang.length > 0) {
        var item = barang[0];
        var notes = item.notes || "";
        var formattedNotes = notes.split('\n').map(line => "- " + line.trim()).join("<br>");
        document.getElementById("notesDisplay").innerHTML = formattedNotes;

        document.getElementById("ocDisplay").textContent = item.oc || "";
        document.getElementById("subtotalDisplay").textContent = item.subtotal || "";
        document.getElementById("tglocDisplay").textContent = item.tgloc || "";
        document.getElementById("ppnDisplay").textContent = item.ppn || "";
        document.getElementById("totalallDisplay").textContent = item.totalall || "";
        document.getElementById("namacustomerDisplay").textContent = item.namacustomer || "";
        document.getElementById("alamatDisplay").textContent = item.alamat || "";
    }


    // === TABEL PENAGIHAN ===
    document.getElementById("barangTablePenagihan").innerHTML = "";
    if (penagihan.length === 0) {
        var emptyRow = document.createElement("tr");
        emptyRow.innerHTML = '<td colspan="5" style="text-align:center;">Belum ada penagihan</td>';
        document.getElementById("barangTablePenagihan").appendChild(emptyRow);
    } else {
        var noPenagihan = 1;
        penagihan.forEach(function(item) {
            var row = document.createElement("tr");
            row.innerHTML =
                "<td>" + (noPenagihan++) + "</td>" +
                "<td>" + item.tglinvoice + "</td>" +
                "<td>" + item.id + "</td>" +
                "<td>" + item.jumlahpembayaran + "</td>" +
                "<td>" + item.totalallpembayaran + "</td>";
            document.getElementById("barangTablePenagihan").appendChild(row);
        });
    }

    // === TABEL PEMBAYARAN ===
    document.getElementById("barangTablePembayaran").innerHTML = "";
    if (pembayaran.length === 0) {
        var emptyRow = document.createElement("tr");
        emptyRow.innerHTML = '<td colspan="5" style="text-align:center;">Belum ada pembayaran</td>';
        document.getElementById("barangTablePembayaran").appendChild(emptyRow);
    } else {
        var noPembayaran = 1;
        pembayaran.forEach(function(item) {
            var row = document.createElement("tr");
            row.innerHTML =
                "<td>" + (noPembayaran++) + "</td>" +
                "<td>" + item.idinvoice + "</td>" +
                "<td>" + item.idpembayaran + "</td>" +
                "<td>" + item.tgl + "</td>" +
                "<td>" + item.totalallpembayaran + "</td>";
            document.getElementById("barangTablePembayaran").appendChild(row);
        });
    }

    // === TAMPILKAN MODAL ===
    modal.style.display = "block";
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
                url: 'marketing/update_statusoc.php', // Pastikan URL ini sesuai dengan file PHP Anda
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
                            window.location.href = 'daftaroc'; // Redirect setelah sukses
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
