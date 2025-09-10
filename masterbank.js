$(document).ready(function () {
    // Inisialisasi DataTables
    $('#myTable').DataTable(); 
    $('#dataTable').DataTable(); 
    $('#dataTableHover').DataTable(); 

    // Klik tombol save
    $(document).on('click', '#saveBank', function () {
        var namabank = $('#namabank').val().trim();

        if (namabank === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Nama Bank tidak boleh kosong!',
            });
            return;
        }

        $.ajax({
            url: 'wgsusermanagement/finance2/simpanmasterbank.php', // sesuaikan path!
            type: 'POST',
            data: { namabank: namabank },
            dataType: 'json', // otomatis parse JSON
            success: function (response) {
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Nama Bank berhasil disimpan.',
                        showConfirmButton: false,
                        timer: 2000
                    }).then(function () {
                        location.reload();
                    });
                    $('#exampleModalLong').modal('hide');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: response.message || 'Terjadi kesalahan, coba lagi.',
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error("Ajax Error:", error);
                console.log("Response:", xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    title: 'Server Error',
                    text: 'Tidak bisa menghubungi server. Cek console log.',
                });
            }
        });
    });
});
