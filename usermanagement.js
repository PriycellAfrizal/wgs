$(document).ready(function () {
    // Inisialisasi DataTables (penting!)
    var table = $('#dataTable').DataTable();

    // Inisialisasi Select2 seperti kode kamu
    $('#menu_key').select2({
        placeholder: "Pilih Menu",
        allowClear: true,
        tags: true,
        width: '100%',
        ajax: {
            url: 'menu_list.php',
            dataType: 'json',
            delay: 250,
            processResults: function (data) {
                return {
                    results: data.map(function (item) {
                        return { id: item, text: item };
                    })
                };
            },
            cache: true
        }
    });

    // Tombol edit
    $(document).on('click', '.btn-edit', function () {
        var userId = $(this).data('id');

        $.ajax({
            url: 'get_user_detail.php',
            type: 'GET',
            data: { id: userId },
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    $('#edit_id').val(response.data.id);
                    $('#edit_nama').val(response.data.nama);

                    $('#menu_key').empty().trigger('change');

                    (response.data.menu_keys || []).forEach(function (menu) {
                        var option = new Option(menu, menu, true, true);
                        $('#menu_key').append(option);
                    });

                    $('#menu_key').trigger('change');
                    $('#modalEdit').modal('show');
                } else {
                    Swal.fire('Error', response.message || 'Gagal memuat data', 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'Gagal menghubungi server', 'error');
            }
        });
    });

    // Submit form update user
    $('#formEditUser').on('submit', function (e) {
        e.preventDefault();

        $.ajax({
            url: 'update_user.php',
            type: 'POST',
            data: $(this).serialize(),
            dataType: 'json',
            success: function (response) {
                if (response.status === 'success') {
                    // Notifikasi sukses muncul 2 detik tanpa tombol OK
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        text: 'Data berhasil diupdate',
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true
                    });

                    // Tutup modal edit
                    $('#modalEdit').modal('hide');

                    // Ambil data terbaru dari form
                    var idUser = $('#edit_id').val();
                    var namaBaru = $('#edit_nama').val();
                    var menuBaru = $('#menu_key').val() || [];

                    // Format menu baru jadi list bernomor dengan <br>
                    var formattedMenu = menuBaru.map(function(m, i) {
                        return (i + 1) + ". " + m;
                    }).join('<br>');

                    // Cari baris tabel berdasarkan data-id tombol edit
                    var row = $("button.btn-edit[data-id='" + idUser + "']").closest('tr');

                    // Update kolom nama (kolom ke-2) dan menu access (kolom ke-4)
                    row.find('td').eq(1).text(namaBaru);
                    row.find('td').eq(3).html(formattedMenu);

                } else {
                    Swal.fire('Error', response.message || 'Gagal mengupdate data', 'error');
                }
            },
            error: function () {
                Swal.fire('Error', 'Gagal mengupdate data', 'error');
            }
        });
    });

});
