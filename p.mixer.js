$(document).ready(function() {
    // Inisialisasi DataTables
    $('#myTable').DataTable();
    $('#dataTable').DataTable();
    $('#dataTableHover').DataTable();

    // Inisialisasi Select2
    $('#spkSelect').select2({
        ajax: {
            url: 'marketing/get_spkmixer.php', // Pastikan URL ini sesuai
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    search: params.term // Parameter pencarian untuk select2
                };
            },
            processResults: function (data) {
                return {
                    results: data // Data harus sesuai dengan format yang diharapkan
                };
            },
            cache: true
        },
        placeholder: 'Pilih SPK',
        minimumInputLength: 0
    });

    // Ketika SPK dipilih, ambil data barang dan nama customer terkait
    $('#spkSelect').on('select2:select', function (e) {
        var spk = e.params.data.id; // Ambil ID SPK yang dipilih

        $.ajax({
            url: 'marketing/get_barangbymixer.php',
            method: 'GET',
            data: { spk: spk },
            dataType: 'json',
            success: function (dataBarang) {
                if (dataBarang && dataBarang.namacustomer) {
                    $('#namacustomer').val(dataBarang.namacustomer);
                }

                if (dataBarang.barang && dataBarang.barang.length > 0) {
                    $('#barangTableBody').empty();
                    dataBarang.barang.forEach(function (item) {
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
                }
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
    var namacustomer= $('#namacustomer').val();
    var warnacabin =  $('#warnacabin').val();
    var warnadrum =  $('#warnadrum').val();
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
        url: 'marketing/simpansuratjalanmixer.php',
        method: 'POST',
        data: {
            namacustomer : namacustomer,
            warnacabin : warnacabin,
            warnadrum : warnadrum,
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

function printDocument(spk) {
    var printUrl = "marketing/print_page.php?spk=" + spk;
    var printWindow = window.open(printUrl, '_blank');
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}
