$(document).on('click', '.finish-btn', function() {
    // Mengambil nilai dari atribut data
    var spk = $(this).data('spk');
    var namabarang = $(this).data('namabarang');
    var qty = $(this).data('qty');

    Swal.fire({
        title: 'Apakah yakin unit sudah terkirim semua?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            // AJAX request untuk mengupdate qty
            $.ajax({
                url: 'marketing/update_spkcopy.php',
                type: 'POST',
                data: {
                    spk: spk,
                    namabarang: namabarang,
                    qty: qty
                },
                success: function(response) {
                    if (response === "success") {
                        Swal.fire({
                            title: 'Berhasil',
                            text: 'Data qty berhasil diperbarui!',
                            icon: 'success',
                            timer: 2000,
                            showConfirmButton: false
                        }).then(() => {
                            setTimeout(function() {
                                location.reload();
                            }, 2000);
                        });
                    } else {
                        Swal.fire('Error', 'Terjadi kesalahan saat memperbarui data.', 'error');
                    }
                },
                error: function() {
                    Swal.fire('Error', 'Terjadi kesalahan saat memperbarui data.', 'error');
                }
            });
        }
    });
});

$(document).ready(function() {
    // Init Select2 untuk SPK
    $('#spkSelect').select2({
        ajax: {
            url: 'marketing/get_spkbplant.php',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { search: params.term };
            },
            processResults: function (data) {
                return { results: data };
            },
            cache: true
        },
        placeholder: 'Pilih SPK',
        minimumInputLength: 0
    });

    // Init DataTable (bisa lebih dari 1 tabel kalau ada)
    $('#myTable').DataTable();
    $('#dataTable').DataTable();
    $('#dataTableHover').DataTable();
    $('#barangTable').DataTable(); // untuk tabel barang

    // Ketika SPK dipilih, ambil data barang terkait
    $('#spkSelect').on('select2:select', function (e) {
        var spk = e.params.data.id;

        $.ajax({
            url: 'marketing/get_barangbybplant.php',
            method: 'GET',
            data: { spk: spk },
            dataType: 'json',
            success: function (dataBarang) {
                // Destroy datatable dulu biar ga error reinit
                if ($.fn.DataTable.isDataTable('#barangTable')) {
                    $('#barangTable').DataTable().destroy();
                }

                $('#barangTableBody').empty();
                dataBarang.forEach(function (item) {
                    var row = `
                        <tr>
                            <td>${item.namabarang}</td>
                            <td><input type="number" class="form-control form-control-sm qty-input" value="${item.qty}" style="width: 70px;" /></td>
                            <td>${item.satuan}</td>
                            <td><button type="button" class="btn btn-danger btn-sm" onclick="hapusRow(this)">Hapus</button></td>
                        </tr>
                    `;
                    $('#barangTableBody').append(row);
                });

                // Re-init setelah data di-append
                $('#barangTable').DataTable();
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data: ", error);
            }
        });
    });
});

function hapusRow(button) {
    $(button).closest('tr').remove();
}

function simpansuratjalan() {
    var tglSuratJalan = $('#tglsuratjalan').val();
    var nomorSuratJalan = $('#nomorsuratjalan').val();
    var spk = $('#spkSelect').val();

    var barangData = [];
    $('#barangTableBody tr').each(function() {
        var namaBarang = $(this).find('td').eq(0).text();
        var qty = $(this).find('.qty-input').val();
        var satuan = $(this).find('td').eq(2).text();
        barangData.push({ spk: spk, namabarang: namaBarang, qty: qty, satuan: satuan });
    });

    $.ajax({
        url: 'marketing/simpansuratjalanbplant.php',
        method: 'POST',
        data: {
            tglsuratjalan: tglSuratJalan,
            nomorsuratjalan: nomorSuratJalan,
            barang: barangData
        },
        dataType: 'json',
        success: function(response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Data berhasil disimpan!',
                    showConfirmButton: false,
                    timer: 2000
                }).then(function() {
                    $('#exampleModalLong').modal('hide');
                    location.reload();
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Terjadi kesalahan',
                    text: response.message,
                    showConfirmButton: true
                });
            }
        },
        error: function(xhr, status, error) {
            console.error("Error saving data: ", error);
            Swal.fire({
                icon: 'error',
                title: 'Terjadi kesalahan',
                text: 'Terjadi kesalahan saat menyimpan data. Cek console untuk detail.',
                showConfirmButton: true
            });
        }
    });
}
