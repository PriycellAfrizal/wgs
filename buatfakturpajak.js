// Fungsi untuk memformat angka menjadi format mata uang dengan 'Rp.'
function formatRupiah(angka) {
    var parts = angka.toString().split(',');
    var integerPart = parts[0];
    var decimalPart = parts.length > 1 ? ',' + parts[1] : '';

    var reverse = integerPart.split('').reverse().join('');
    var ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');

    return 'Rp. ' + ribuan + decimalPart;
}

// Fungsi untuk menghapus format mata uang dan mengembalikan nilai numerik
function parseRupiah(rupiah) {
    var cleaned = rupiah.replace(/Rp\.|\./g, '').replace(',', '.');
    return parseFloat(cleaned) || 0;
}

function formatOnInput(element) {
    let value = element.value.replace(/[^0-9,]/g, '');
    
    let parts = value.split(',');
    let integerPart = parts[0];
    let decimalPart = parts.length > 1 ? ',' + parts[1] : '';

    let reverse = integerPart.split('').reverse().join('');
    let ribuan = reverse.match(/\d{1,3}/g);
    ribuan = ribuan.join('.').split('').reverse().join('');

    element.value = 'Rp. ' + ribuan + decimalPart;

    updateTotalPrice();
}

// Fungsi untuk menghitung totalall
function updateTotalPrice() {
    var subtotal = parseRupiah($('#subtotal').val());

    // Hitung PPN sebagai 11% dari subtotal
    var ppn = subtotal * 0.11;

    // Ambil nilai perbandingan
    var subtotalPerbandingan = parseRupiah($('#subtotalperbandingan').val());
    var ppnPerbandingan = subtotalPerbandingan * 0.11; // Hitung PPN perbandingan sebagai 11% dari subtotal perbandingan
    var totalallPerbandingan = subtotalPerbandingan + ppnPerbandingan;

    var alertMessages = [];
    var subtotalPerbandinganAsli = formatRupiah(subtotalPerbandingan);
    var ppnPerbandinganAsli = formatRupiah(ppnPerbandingan);
    var totalallPerbandinganAsli = formatRupiah(totalallPerbandingan);

    // Notifikasi jika melebihi batas
    if (subtotal > subtotalPerbandingan) {
        alertMessages.push('DPP tidak boleh melebihi ' + subtotalPerbandinganAsli);
        $('#subtotal').val(formatRupiah(subtotalPerbandingan));
        subtotal = subtotalPerbandingan; // Update subtotal to the max allowed value
    }

    if (ppn > ppnPerbandingan) {
        alertMessages.push('PPN tidak boleh melebihi ' + ppnPerbandinganAsli);
        ppn = ppnPerbandingan; // Adjust PPN to the max allowed value
    }

    var totalall = subtotal + ppn;
    if (totalall > totalallPerbandingan) {
        alertMessages.push('Jumlah tidak boleh melebihi ' + totalallPerbandinganAsli);
        totalall = totalallPerbandingan; // Adjust total to the max allowed value
    }

    // Set nilai totalall, ppn, and update perbandingan
    $('#totalall').val(formatRupiah(totalall.toFixed(2).replace('.', ',')));
    $('#ppn').val(formatRupiah(ppn.toFixed(2).replace('.', ',')));
    $('#ppnperbandingan').val(formatRupiah(ppnPerbandingan.toFixed(2).replace('.', ',')));
    $('#totalallperbandingan').val(formatRupiah(totalallPerbandingan.toFixed(2).replace('.', ',')));

    // Tampilkan pesan peringatan jika ada
    if (alertMessages.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan!',
            text: alertMessages.join(' '),
            confirmButtonText: 'OK'
        });
    }
}



$(document).ready(function () {
    $('#myTable, #dataTable, #dataTableHover').DataTable();

    $(".nopo").select2({
        placeholder: 'Search nopo...',
        ajax: {
            url: 'purchaselocal/get_nopo.php',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { search: params.term };
            },
            processResults: function (data) {
                return {
                    results: data.map(function (item) {
                        return { id: item.id, text: item.text };
                    })
                };
            },
            cache: true
        }
    });

    $('.nopo').on('select2:select', function (e) {
        var nopo = e.params.data.id;

        $.ajax({
            url: 'purchaselocal/get_po_details.php',
            dataType: 'json',
            method: 'GET',
            data: { nopo: nopo },
            success: function (data) {
                $('#namasuplier').val(data.namasuplier);
                $('#npwp').val(data.npwp);
                $('#subtotal').val(formatRupiah(data.subtotal));
                $('#subtotalperbandingan').val(formatRupiah(data.subtotal));
                
                // Panggil updateTotalPrice setelah mendapatkan nilai baru
                updateTotalPrice();
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', status, error);
            }
        });
    });

    $('#subtotal').on('input', function () {
        formatOnInput(this);
    });

    $('#subtotalperbandingan').on('input', function () {
        formatOnInput(this);
    });

    $(document).on('input', 'input[name="npwp"], input[name="nofp"]', function () {
        this.value = this.value.replace(/[^0-9-.]/g, '');
    });
});





// Array to keep track of selected nopo values
var selectedNopo = [];

$(document).ready(function () {
    $('#myTable, #dataTable, #dataTableHover').DataTable();

    $(".nopo").select2({
        placeholder: 'Search nopo...',
        ajax: {
            url: 'purchaselocal/get_nopo.php',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { search: params.term };
            },
            processResults: function (data) {
                // Filter out the selected nopo values
                var filteredData = data.filter(function (item) {
                    return !selectedNopo.includes(item.id);
                });
                return {
                    results: filteredData.map(function (item) {
                        return { id: item.id, text: item.text };
                    })
                };
            },
            cache: true
        }
    });

    $('.nopo').on('select2:select', function (e) {
        var nopo = e.params.data.id;

        // Add the selected nopo to the list
        selectedNopo.push(nopo);

        // Handle fetching and populating PO details after selection
        var rowCount = $(this).closest('tr').index(); // Get the row index
        $.ajax({
            url: 'purchaselocal/get_po_details.php',
            dataType: 'json',
            method: 'GET',
            data: { nopo: nopo },
            success: function (data) {
                $('#namasuplier_' + rowCount).val(data.namasuplier);
                $('#npwp_' + rowCount).val(data.npwp);
                $('#subtotal_' + rowCount).val(formatRupiah(data.subtotal));
                $('#subtotalperbandingan_' + rowCount).val(formatRupiah(data.subtotal));
                
                // Call updateTotalPrice after getting new values
                updateTotalPriceForRow(rowCount);
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', status, error);
            }
        });
    });

    $('#subtotal').on('input', function () {
        formatOnInput(this);
    });

    $('#subtotalperbandingan').on('input', function () {
        formatOnInput(this);
    });

    $(document).on('input', 'input[name="npwp"], input[name="nofp"]', function () {
        this.value = this.value.replace(/[^0-9-.]/g, '');
    });
});

function addRowToModal() {
    // Get table and row count
    var table = document.querySelector('#fakturPajakTable tbody');
    var rowCount = table.rows.length;  // Get current number of rows
    var row = table.insertRow(rowCount);  // Insert new row at the end

    // Create cells for the new row
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    var cell5 = row.insertCell(4);
    var cell6 = row.insertCell(5);
    var cell7 = row.insertCell(6);
    var cell8 = row.insertCell(7);

    // Populate cells with content
    cell1.innerHTML = rowCount + 1; // Row number
    cell2.innerHTML = '<select id="nopo_' + rowCount + '" name="nopo[]" class="nopo form-control form-control-sm mb-3" required data-placeholder="Search nopo ..."></select>';
    cell3.innerHTML = '<input type="text" id="nofp_' + rowCount + '" name="nofp[]" autocomplete="off" required class="form-control form-control-sm mb-3" style="width: 200px;">';
    cell4.innerHTML = '<input readonly type="text" name="namasuplier[]" id="namasuplier_' + rowCount + '" class="form-control form-control-sm mb-3" style="width: 270px;">';
    cell5.innerHTML = '<input type="text" name="subtotal[]" id="subtotal_' + rowCount + '" class="form-control form-control-sm mb-3" style="width: 200px;" onblur="formatInput(this, ' + rowCount + ')">';
    
    // Hidden input for subtotal comparison
    cell5.innerHTML += '<input type="text" hidden name="subtotalperbandingan[]" id="subtotalperbandingan_' + rowCount + '" class="form-control form-control-sm mb-3" style="width: 200px;">';

    cell6.innerHTML = '<input type="text" name="ppn[]" id="ppn_' + rowCount + '" readonly class="form-control form-control-sm mb-3" style="width: 200px;">';
    // Hidden input for ppn comparison
    cell6.innerHTML += '<input type="text" hidden name="ppnperbandingan[]" id="ppnperbandingan_' + rowCount + '" class="form-control form-control-sm mb-3" style="width: 200px;">';

    cell7.innerHTML = '<input readonly type="text" name="totalall[]" id="totalall_' + rowCount + '" class="form-control form-control-sm mb-3" style="width: 200px;">';
    // Hidden input for totalall comparison
    cell7.innerHTML += '<input type="text" hidden name="totalallperbandingan[]" id="totalallperbandingan_' + rowCount + '" class="form-control form-control-sm mb-3" style="width: 200px;">';

    cell8.innerHTML = '<input type="text" autocomplete="off" required id="npwp_' + rowCount + '" class="form-control form-control-sm mb-3" name="npwp[]" style="width:200px;">';

    // Initialize select2 for nopo dropdown
    $('#nopo_' + rowCount).select2({
        placeholder: 'Search nopo...',
        ajax: {
            url: 'purchaselocal/get_nopo.php',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return { search: params.term };
            },
            processResults: function (data) {
                // Filter out the selected nopo values
                var filteredData = data.filter(function (item) {
                    return !selectedNopo.includes(item.id);
                });
                return {
                    results: filteredData.map(function (item) {
                        return { id: item.id, text: item.text };
                    })
                };
            },
            cache: true
        }
    });

    // Event listener for 'select' on nopo
    $('#nopo_' + rowCount).on('select2:select', function (e) {
        var nopo = e.params.data.id;

        // Add the selected nopo to the list
        selectedNopo.push(nopo);

        $.ajax({
            url: 'purchaselocal/get_po_details.php',
            dataType: 'json',
            method: 'GET',
            data: { nopo: nopo },
            success: function (data) {
                $('#namasuplier_' + rowCount).val(data.namasuplier);
                $('#npwp_' + rowCount).val(data.npwp);
                $('#subtotal_' + rowCount).val(formatRupiah(data.subtotal));
                $('#subtotalperbandingan_' + rowCount).val(formatRupiah(data.subtotal));
                
                // Call updateTotalPrice after getting new values
                updateTotalPriceForRow(rowCount);
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', status, error);
            }
        });
    });

    // Input format for subtotal
    $('#subtotal_' + rowCount).on('input', function () {
        formatOnInput(this);
        updateTotalPriceForRow(rowCount);
    });

    // Input format for npwp
    $('#npwp_' + rowCount).on('input', function () {
        this.value = this.value.replace(/[^0-9-.]/g, '');
    });
}

// Fungsi untuk menghitung total dan memperbarui total untuk baris tertentu
function updateTotalPriceForRow(rowCount) {
    var subtotal = parseRupiah($('#subtotal_' + rowCount).val());

    // Hitung PPN sebagai 11% dari subtotal
    var ppn = subtotal * 0.11;

    // Ambil nilai perbandingan
    var subtotalPerbandingan = parseRupiah($('#subtotalperbandingan_' + rowCount).val());
    var ppnPerbandingan = subtotalPerbandingan * 0.11; // Hitung PPN perbandingan sebagai 11% dari subtotal perbandingan
    var totalallPerbandingan = subtotalPerbandingan + ppnPerbandingan;

    var alertMessages = [];
    var subtotalPerbandinganAsli = formatRupiah(subtotalPerbandingan);
    var ppnPerbandinganAsli = formatRupiah(ppnPerbandingan);
    var totalallPerbandinganAsli = formatRupiah(totalallPerbandingan);

    // Notifikasi jika melebihi batas
    if (subtotal > subtotalPerbandingan) {
        alertMessages.push('DPP tidak boleh melebihi ' + subtotalPerbandinganAsli);
        $('#subtotal_' + rowCount).val(formatRupiah(subtotalPerbandingan));
        subtotal = subtotalPerbandingan; // Update subtotal to the max allowed value
    }

    if (ppn > ppnPerbandingan) {
        alertMessages.push('PPN tidak boleh melebihi ' + ppnPerbandinganAsli);
        ppn = ppnPerbandingan; // Adjust PPN to the max allowed value
    }

    var totalall = subtotal + ppn;
    if (totalall > totalallPerbandingan) {
        alertMessages.push('Jumlah tidak boleh melebihi ' + totalallPerbandinganAsli);
        totalall = totalallPerbandingan; // Adjust total to the max allowed value
    }

    // Set nilai totalall, ppn, and update perbandingan
    $('#totalall_' + rowCount).val(formatRupiah(totalall.toFixed(2).replace('.', ',')));
    $('#ppn_' + rowCount).val(formatRupiah(ppn.toFixed(2).replace('.', ',')));
    $('#ppnperbandingan_' + rowCount).val(formatRupiah(ppnPerbandingan.toFixed(2).replace('.', ',')));
    $('#totalallperbandingan_' + rowCount).val(formatRupiah(totalallPerbandingan.toFixed(2).replace('.', ',')));

    // Tampilkan pesan peringatan jika ada
    if (alertMessages.length > 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Peringatan!',
            text: alertMessages.join(' '),
            confirmButtonText: 'OK'
        });
    }
}












function saveAllData() {
    var tglfp = $('#tglfp').val(); // Global date
    var status = $('#status').val(); // Global status

    // Validate that tglfp is set
    if (!tglfp) {
        Swal.fire({
            icon: 'warning',
            title: 'Perhatian',
            text: 'Tanggal Faktur Pajak harus diisi',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });
        return;
    }

    // Array to store all the row data
    var allData = [];

    // Loop through each row in the table to collect data for each row
    $('#fakturPajakTable tbody tr').each(function() {
        var nofp = $(this).find('input[name="nofp[]"]').val(); // Get nofp for the row
        var nopo = $(this).find('select[name="nopo[]"]').val();
        var namasuplier = $(this).find('input[name="namasuplier[]"]').val();
        var subtotal = $(this).find('input[name="subtotal[]"]').val();
        var ppn = $(this).find('input[name="ppn[]"]').val();
        var totalall = $(this).find('input[name="totalall[]"]').val();
        var npwp = $(this).find('input[name="npwp[]"]').val();

        // Validate that all necessary fields for this row are filled
        if (!nofp || !nopo || !namasuplier || !subtotal || !ppn || !totalall || !npwp) {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Semua data pada setiap baris harus diisi',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
            return false; // Stop the iteration if validation fails
        }

        // Push the row data into the allData array
        allData.push({
            nofp: nofp,             // Add nofp
            nopo: nopo,
            namasuplier: namasuplier,
            subtotal: subtotal,
            ppn: ppn,
            totalall: totalall,
            npwp: npwp
        });
    });

    // If no row data has been collected, show a warning
    if (allData.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Perhatian',
            text: 'Tidak ada data yang dapat disimpan',
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
        });
        return;
    }




    // Send the data to the server using AJAX
    $.ajax({
        url: 'purchaselocal/save_fakturpajak.php', // PHP script that handles saving and updating
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            tglfp: tglfp,
            status: status,
            fakturPajakData: allData
        }),
        success: function(response) {
            var res = JSON.parse(response);
            Swal.fire({
                icon: 'success',
                title: 'Data berhasil disimpan',
                text: res.message,
                timer: 2000,
                timerProgressBar: true,
               showConfirmButton: false
        }).then(() => {
            // Reload the page after the success message is closed
            location.reload();
        });
    },
        error: function(xhr, status, error) {
            Swal.fire({
                icon: 'error',
                title: 'Terjadi Kesalahan',
                text: 'Tidak dapat menyimpan data.',
                timer: 2000,
                timerProgressBar: true,
                showConfirmButton: false
            });
        }
    });
}
















$(document).ready(function() {
    // Handler untuk tombol Edit
    $(document).on('click', '.editButton', function() {
        var no = $(this).data('no');
        console.log(no); // Debug: Cek ID yang dikirimkan

        $('#no').val(no);

        $.ajax({
            url: 'purchaselocal/get_fp.php',
            type: 'GET',
            data: {no: no},
            dataType: 'json',
            success: function(response) {
                console.log(response); // Debug: Cek respons dari server

                if (response.error) {
                    console.error('Error:', response.error);
                    alert(response.error);
                } else {
                    // Isi modal dengan data yang diambil
                    $('#nopoedit').val(response.nopo);
                    $('#npwpedit').val(response.npwp);
                    $('#nofpedit').val(response.nofp);

                    // Tampilkan modal
                    $('#editModal').modal('show');
                }
            },
            error: function(xhr, status, error) {
                console.error('Error fetching data:', error);
                console.error('Response:', xhr.responseText); // Print response text for debugging
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Terjadi kesalahan saat mengambil data ID.'
                });
            }
        });
    });
});

   // Handler untuk tombol Simpan
    $("#saveButton").on("click", function() {
        $.ajax({
            url: 'purchaselocal/simpan_datafp.php',
            method: 'POST',
            data: $("#editForm").serialize(),
            dataType: 'json', // Mengatur tipe data yang diharapkan dari server
            beforeSend: function() {
                $('#editModal').modal('hide');
            },
            success: function(response) {
                if (response.status === "success") {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil',
                        text: response.message,
                        timer: 2000,
                        showConfirmButton: false
                    }).then(() => {
                        setTimeout(() => {
                            location.reload(); // Reload halaman setelah 2 detik
                        },);
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Gagal',
                        text: response.message
                    });
                }
            },
            error: function(xhr, status, error) {
                console.error(xhr.responseText);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Terjadi kesalahan saat memperbarui.'
                });
            }
        });
    });












