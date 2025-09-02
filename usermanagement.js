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
$(document).ready(function () {
    var table = $('#dataTable').DataTable();

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

                    var container = $('#menuFeatureContainer');
                    container.empty();

                    (response.data.access || []).forEach(function (item, idx) {
                        var menu = item.menu_key;
                        var feature = item.feature || 'viewer';

                        var block = `
                            <div class="row align-items-center mb-2">
                                <div class="col-md-6">
                                    <input type="hidden" name="menu_key[]" value="${menu}">
                                    <input type="text" class="form-control bg-light" value="${menu}" disabled>
                                </div>
                                <div class="col-md-6">
                                    <select name="feature[]" class="form-select">
                                        <option value="viewer" ${feature === 'viewer' ? 'selected' : ''}>Viewer</option>
                                        <option value="editor" ${feature === 'editor' ? 'selected' : ''}>Editor</option>
                                    </select>
                                </div>
                            </div>
                        `;
                        container.append(block);
                    });

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
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        text: 'Data berhasil diupdate',
                        timer: 2000,
                        showConfirmButton: false,
                        timerProgressBar: true
                    });

                    $('#modalEdit').modal('hide');
                    table.ajax.reload(null, false); // reload datatable tanpa refresh
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
