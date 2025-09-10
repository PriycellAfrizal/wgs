$(document).ready(function () {
    $('#dataTable').DataTable({
        "ordering": true, // biarkan sorting bekerja di background
        "order": [[5, 'asc'], [1, 'desc']],  // Urutkan berdasarkan status dan tanggal
        "columnDefs": [
            {
                "targets": "_all",   // semua kolom
                "orderable": false   // matikan panah sorting
            },
            {
                "targets": [5], // Kolom status
                "orderable": false, // hilangkan panah sorting di header status
                "render": function (data, type, row) {
                    if (type === 'display') {
                        return data; // Tampilkan data asli
                    }
                    // Urutkan berdasarkan status: SPK PENDING < SPK ISSUED
                    return data === 'SPK PENDING' ? 1 : 2; 
                }
            },
            {
                "targets": [1], // Kolom tanggal
                "orderable": false, // hilangkan panah sorting di header tanggal
                "render": function (data, type) {
                    if (type === 'sort' || type === 'type') {
                        return moment(data, 'DD MMMM YYYY').format('YYYYMMDD');
                    }
                    return data; 
                }
            }
        ]
    });
});


 function closeModal() {
            document.getElementById('myModal').style.display = 'none';
        }
// Mendapatkan elemen modal
var modal = document.getElementById("myModal");

// Menambahkan event listener ke body untuk menutup modal saat lik di luar
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


  // Deklarasikan variabel infoButtons
  var infoButtons;

  infoButtons.forEach(function(button) {
    button.addEventListener('click', function(event) {
      event.preventDefault();
      var spk = this.dataset.spk;

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

      xhr.open('GET', 'get_spkk.php?spk=' + encodeURIComponent(spk), true);
      xhr.send();
    });
  });

  function showDetails(barang) {
    // Bersihkan isi tabel sebelum menambahkan data baru
    document.getElementById("barangTableBody").innerHTML = "";

    var nomor = 1;

    // Tambahkan data barang ke dalam tabel
    barang.forEach(function(item) {
      var row = document.createElement("tr");
      row.innerHTML = " <td>" + nomor++ + "</td>  <td>" + item.namabarang + "</td>  <td>" + item.qty + "</td>   <td>" + item.satuan + "</td>     " ;
      document.getElementById("barangTableBody").appendChild(row);
    });







        // Proses dan tampilkan notes dengan setiap baris diawali tanda *
        var notes = barang[0].notespk || ""; // Pastikan notes ada atau berikan string kosong
        var lines = notes.split('\n'); // Pecah teks menjadi baris-baris
        var formattedNotes = lines.map(line => " " + line.trim()).join('<br>'); // Tambahkan * di awal setiap baris dan gabungkan kembali dengan <br>
        document.getElementById("notesDisplay").innerHTML = formattedNotes; // Gunakan innerHTML agar format asli tetap terjaga



    // Set nilai quotesDisplay dan salesDisplay
    document.getElementById("spkDisplay").textContent = barang[0].spk; // Ubah sesuai struktur JSON yang diterima

    document.getElementById("tglspkDisplay").textContent = barang[0].tglspk; // Ubah sesuai struktur JSON yang diterima

    document.getElementById("alamatDisplay").textContent = barang[0].alamat; // Ubah sesuai struktur JSON yang diterima

     document.getElementById("ocDisplay").textContent = barang[0].oc; // Ubah sesuai struktur JSON yang diterima

     document.getElementById("tglocDisplay").textContent = barang[0].tglpo; // Ubah sesuai struktur JSON yang diterima
     document.getElementById("poDisplay").textContent = barang[0].pocust; // Ubah sesuai struktur JSON yang diterima
     document.getElementById("tglocDisplay").textContent = barang[0].tglpo; // Ubah sesuai struktur JSON yang diterima
     document.getElementById("namacustomerDisplay").textContent = barang[0].namacustomer; // Ubah sesuai struktur JSON yang diterima
    modal.style.display = "block";
  }
});


function updateStatusSPK(spk) {
    Swal.fire({
        title: `<span style="font-weight: normal; color: black;">Apakah yakin ingin menyetujui SPK <strong>${spk}</strong>?</span>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak'
    }).then((result) => {
        if (result.isConfirmed) {
            // Tampilkan loading saat mengirim email
            Swal.fire({
                title: 'Sedang mengirim email SPK kepada Warehouse...',
                text: 'Harap tunggu sebentar.',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Kirim request ke server
            $.ajax({
                url: 'update_statusspk.php',
                type: 'POST',
                data: { spk: spk },
                success: function(response) {
                    Swal.close(); // Tutup loading

                    // Pastikan kita handle responsenya bersih
                    const trimmedResponse = response.trim().toLowerCase();

                    if (trimmedResponse === 'email sent') {
                        Swal.fire({
                            icon: 'success',
                            title: `SPK ${spk} berhasil dikirim kepada Warehouse`,
                            text: 'Email berhasil dikirim.',
                            showConfirmButton: false,
                            timer: 2000
                        }).then(() => {
                            window.location.href = 'daftarspksa'; // Redirect setelah sukses
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Mengirim Email',
                            html: `Pesan Kesalahan:<br><pre style="text-align:left;">${response}</pre>`,
                            confirmButtonText: 'OK'
                        });
                    }
                },
                error: function(xhr, status, error) {
                    Swal.close(); // Tutup loading

                    Swal.fire({
                        icon: 'error',
                        title: 'Kesalahan Koneksi',
                        text: 'Gagal mengirim permintaan ke server. Periksa koneksi internet Anda.',
                        footer: `<pre style="text-align:left;">${error}</pre>`
                    });

                    console.error("AJAX Error:", xhr.responseText);
                }
            });
        }
    });
}



