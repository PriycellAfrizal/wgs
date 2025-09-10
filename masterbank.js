 $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 
        $('#dataTableHover').DataTable(); // ID From dataTable with Hover


    });

  document.getElementById('saveBank').addEventListener('click', function () {
        var namabank = document.getElementById('namabank').value;

        if (namabank === '') {
            alert('Nama Bank tidak boleh kosong');
            return;
        }

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '../finance2/simpanmasterbank.php', true); // Endpoint PHP untuk menyimpan data
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var response = JSON.parse(xhr.responseText);

                if (response.success) {
                    // Menampilkan notifikasi sukses menggunakan SweetAlert
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Nama Bank berhasil disimpan.',
                        showConfirmButton: false,
                        timer: 2000 // Notifikasi muncul selama 2 detik
                    }).then(function () {
                        // Reload halaman setelah 2 detik
                        location.reload();
                    });

                    $('#exampleModalLong').modal('hide'); // Menutup modal setelah berhasil
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: 'Terjadi kesalahan, coba lagi.',
                    });
                }
            }
        };

        xhr.send('namabank=' + encodeURIComponent(namabank)); // Kirim data nama bank
    });
