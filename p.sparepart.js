
$(document).ready(function () {
    // Inisialisasi DataTables
    $('#myTable').DataTable();
    $('#dataTable').DataTable();
    $('#dataTableHover').DataTable();

    // Inisialisasi Select2 untuk SPK
    $('#spkSelect').select2({
        ajax: {
            url: 'marketing/get_spksparepart.php', // Endpoint SPK
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { search: params.term };
            },
            processResults: function (data) {
                return { results: data }; // Harus sesuai format select2
            },
            cache: true
        },
        placeholder: 'Pilih SPK',
        minimumInputLength: 0
    });

    // Ketika SPK dipilih, ambil data barang terkait
    $('#spkSelect').on('select2:select', function (e) {
        var spk = e.params.data.id;

        $.ajax({
            url: 'marketing/get_barangbyspksparepart.php',
            method: 'GET',
            data: { spk: spk },
            dataType: 'json',
            success: function (dataBarang) {
                $('#barangTableBody').empty();

                dataBarang.forEach(function (item) {
                    var row = `
                        <tr>
                            <td>${item.namabarang}</td>
                            <td><input type="number" class="form-control form-control-sm qty-input" 
                                       value="${item.qty}" style="width: 70px;" /></td>
                            <td>${item.satuan}</td>
                            <td><button type="button" class="btn btn-danger btn-sm" onclick="hapusRow(this)">Hapus</button></td>
                        </tr>
                    `;
                    $('#barangTableBody').append(row);
                });
            },
            error: function (xhr, status, error) {
                console.error("Error fetching data: ", error);
            }
        });
    });
});

// Fungsi cetak dokumen
function printDocument(spk) {
    var printUrl = "marketing/print_pagesparepart.php?spk=" + spk;
    var printWindow = window.open(printUrl, '_blank');

    if (printWindow) {
        printWindow.onload = function () {
            printWindow.print();
            printWindow.onafterprint = function () {
                printWindow.close();
            };
        };
    } else {
        alert("Popup diblokir, izinkan popup untuk melanjutkan cetak.");
    }
}

// Fungsi hapus row barang
function hapusRow(button) {
    $(button).closest('tr').remove();
}

// Fungsi simpan surat jalan
function simpansuratjalan() {
    var tglSuratJalan = $('#tglsuratjalan').val();
    var nomorSuratJalan = $('#nomorsuratjalan').val();
    var spk = $('#spkSelect').val();

    var barangData = [];
    $('#barangTableBody tr').each(function () {
        var namaBarang = $(this).find('td').eq(0).text();
        var qty = $(this).find('.qty-input').val();
        var satuan = $(this).find('td').eq(2).text();

        barangData.push({ spk: spk, namabarang: namaBarang, qty: qty, satuan: satuan });
    });

    $.ajax({
        url: 'marketing/simpansuratjalan.php',
        method: 'POST',
        data: {
            tglsuratjalan: tglSuratJalan,
            nomorsuratjalan: nomorSuratJalan,
            barang: barangData
        },
        dataType: 'json',
        success: function (response) {
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Data berhasil disimpan!',
                    showConfirmButton: false,
                    timer: 2000
                }).then(function () {
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
        error: function (xhr, status, error) {
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
