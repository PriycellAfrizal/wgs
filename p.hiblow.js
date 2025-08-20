


document.addEventListener("DOMContentLoaded", function() {
    // Mendapatkan elemen DOM
    var inputTanggal = document.getElementById("tglsuratjalan");
    
    // Mendapatkan tanggal hari ini
    var today = new Date();
    var day = today.getDate();
    var month = today.toLocaleString('default', { month: 'long' }); // Nama bulan dalam format panjang
    var year = today.getFullYear();
    
    // Format tanggal untuk tampilan (tgl bulan thn)
    var displayDate = `${day} ${month} ${year}`;
    
    // Mengatur nilai input
    inputTanggal.value = displayDate;
});

$(document).ready(function() {
    // ✅ Inisialisasi DataTables
    $('#myTable').DataTable();
    $('#dataTable').DataTable();
    $('#dataTableHover').DataTable();

    // ✅ Inisialisasi Select2
    $('#spkSelect').select2({
        ajax: {
            url: 'marketing/get_spkhiblow.php', // Pastikan URL ini sesuai
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

        // Ambil barang dan nama customer berdasarkan SPK
        $.ajax({
            url: 'marketing/get_barangbyhiblow.php',
            method: 'GET',
            data: { spk: spk },
            dataType: 'json',
            success: function (dataBarang) {
                if (dataBarang && dataBarang.namacustomer) {
                    $('#namacustomer').val(dataBarang.namacustomer); // Set nama customer
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
    var warnatangki =  $('#warnatangki').val();
    var panjangcopel =  $('#panjangcopel').val();
    var pto =  $('#pto').val();
    var tglSuratJalan = $('#tglsuratjalan').val();
    var nomorSuratJalan = $('#nomorsuratjalan').val();
    var spk = $('#spkSelect').val(); // Ambil nilai SPK dari dropdown

    var barangData = [];
    $('#barangTableBody tr').each(function() {
        var namaBarang = $(this).find('td').eq(0).text();
        var qty = $(this).find('.qty-input').val();
        var satuan = $(this).find('td').eq(2).text();
        barangData.push({ spk: spk, namabarang: namaBarang, qty: qty, satuan: satuan });
    });

    $.ajax({
        url: 'marketing/simpansuratjalanhiblow.php',
        method: 'POST',
        data: {
            pto : pto,
            namacustomer : namacustomer,
            warnacabin : warnacabin,
            warnatangki : warnatangki,
            panjangcopel : panjangcopel,
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
    var printUrl = "marketing/print_pagehiblow.php?spk=" + spk;
    var printWindow = window.open(printUrl, '_blank');
    printWindow.onload = function() {
        printWindow.print();
        printWindow.onafterprint = function() {
            printWindow.close();
        };
    };
}
