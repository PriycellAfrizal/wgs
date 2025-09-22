  $(document).ready(function () {
    // Inisialisasi DataTables untuk tabel dengan ID tertentu
    $('#myTable').DataTable();
    $('#dataTable').DataTable();
    $('#dataTableHover').DataTable();

    // Event listener untuk input 'npwp' dan 'nofp' untuk memastikan hanya karakter yang valid
    $(document).on('input', 'input[name="npwp"], input[name="nofp"]', function () {
        this.value = this.value.replace(/[^0-9-.]/g, '');
    });

    // Event listener untuk pencarian tabel
    var searchInput = document.getElementById('searchInput'); // Input pencarian
    var tbody = document.getElementById('table-sp'); // Tabel yang akan dicari

    searchInput.addEventListener('keyup', searchTable); // Event saat mengetik di kolom pencarian

    // Fungsi untuk mencari data di tabel berdasarkan input pencarian
    function searchTable() {
        var searchTerm = searchInput.value.toLowerCase(); // Ambil input pencarian
        var rows = tbody.getElementsByTagName('tr'); // Ambil semua baris dalam tabel

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            var cells = row.getElementsByTagName('td'); // Ambil semua kolom dalam baris
            var text = '';

            for (var j = 0; j < cells.length; j++) {
                text += cells[j].textContent.toLowerCase(); // Gabungkan semua teks dalam kolom
            }

            // Menampilkan atau menyembunyikan baris berdasarkan pencarian
            if (text.indexOf(searchTerm) > -1) {
                row.style.display = ''; // Menampilkan baris jika ditemukan
            } else {
                row.style.display = 'none'; // Menyembunyikan baris jika tidak ditemukan
            }
        }
    }

    // Menambahkan event listener untuk checkbox dan baris tabel
    var rows = document.querySelectorAll('#table-sp tr'); // Ambil semua baris dalam tabel SP

    rows.forEach(function (row) {
        var checkbox = row.querySelector('.row-select'); // Checkbox dalam baris

        // Event listener untuk perubahan pada checkbox
        checkbox.addEventListener('change', function () {
            if (checkbox.checked) {
                row.classList.add('selected'); // Menambahkan kelas 'selected' jika checkbox dicentang
            } else {
                row.classList.remove('selected'); // Menghapus kelas 'selected' jika checkbox tidak dicentang
            }
        });

        // Event listener untuk klik pada baris (selain checkbox)
        row.addEventListener('click', function (event) {
            // Cek apakah yang diklik adalah checkbox atau bukan
            if (event.target.type !== 'checkbox') {
                checkbox.checked = !checkbox.checked; // Toggle status checkbox
                if (checkbox.checked) {
                    row.classList.add('selected');
                } else {
                    row.classList.remove('selected');
                }
            }
        });

        // Mengubah kursor mouse saat berada di atas baris
        row.addEventListener('mousemove', function () {
            row.style.cursor = 'pointer'; // Menampilkan kursor pointer
        });
    });

    // Event listener untuk tombol "Select All" (checkbox untuk memilih semua)
    var selectAllCheckbox = document.getElementById('select-all');
    selectAllCheckbox.addEventListener('change', function () {
        rows.forEach(function (row) {
            var checkbox = row.querySelector('.row-select');
            checkbox.checked = selectAllCheckbox.checked; // Menyinkronkan checkbox dengan 'Select All'

            if (selectAllCheckbox.checked) {
                row.classList.add('selected'); // Menambahkan kelas 'selected' untuk semua baris
            } else {
                row.classList.remove('selected'); // Menghapus kelas 'selected' jika tidak dipilih
            }
        });
    });
});







        function formatInput(element) {
            let value = element.value;
            
            // Remove 'Rp.' prefix and trim whitespace
            value = value.replace(/^Rp\.\s*/, '').trim();

            // If value does not contain a comma, add ',00' at the end
            if (value.indexOf(',') === -1) {
                value += ',00';
            } else {
                // If it contains a comma but only has one decimal place, add another zero
                let parts = value.split(',');
                if (parts[1].length === 1) {
                    value += '0';
                }
            }

            // Add 'Rp. ' prefix back and update the input's value
            element.value = 'Rp. ' + value;
        }
    
// Fungsi untuk memformat input menjadi format rupiah dengan pemisah ribuan titik dan desimal koma
function formatRupiah(angka) {
    var number_string = angka.replace(/[^,\d]/g, '').toString(),
        split = number_string.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
        separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] !== undefined ? rupiah + ',' + split[1] : rupiah;
    return 'Rp. ' + rupiah;
}

// Fungsi untuk memvalidasi input dan memperbarui totalall
function validateAndUpdateTotal(input) {
    var row = input.closest('tr');
    var subtotalInput = row.querySelector('input[name="subtotal"]');
    var ppnInput = row.querySelector('input[name="ppn"]');
    var pembulatanInput = row.querySelector('input[name="pembulatan"]');
    var totalallInput = row.querySelector('input[name="totalall"]');

    var initialSubtotal = parseFloat(subtotalInput.getAttribute('data-initial').replace(/[^,\d]/g, '').replace(',', '.'));
    var initialPpn = parseFloat(ppnInput.getAttribute('data-initial').replace(/[^,\d]/g, '').replace(',', '.'));

    var currentSubtotal = parseFloat(subtotalInput.value.replace(/[^,\d]/g, '').replace(',', '.')) || 0;
    var currentPpn = parseFloat(ppnInput.value.replace(/[^,\d]/g, '').replace(',', '.')) || 0;
    var currentPembulatan = parseFloat(pembulatanInput.value) || 0;

    var maxTotalall = initialSubtotal + initialPpn;

    var totalall = currentSubtotal + currentPpn + currentPembulatan;

    // Cek jika pembulatan diubah dari nilai awal
    var initialPembulatan = parseFloat(pembulatanInput.getAttribute('data-initial')) || 0;

    if (currentPembulatan > initialPembulatan) {
        // Izinkan totalall melebihi nilai maksimum jika pembulatan diubah
        updateTotalAll(row);
    } else {
        if (totalall > maxTotalall) {
            Swal.fire({
                icon: 'warning',
                title: 'Peringatan',
                text: 'Total tidak boleh lebih besar dari nilai awal!',
                allowOutsideClick: true,
                timer: 2000,
                confirmButtonText: 'OK',
                focusConfirm: true
            }).then((result) => {
                if (result.isConfirmed || result.dismiss === Swal.DismissReason.timer) {
                    // Reset nilai jika perlu
                    subtotalInput.value = formatRupiah(subtotalInput.getAttribute('data-initial'));
                    ppnInput.value = formatRupiah(ppnInput.getAttribute('data-initial'));
                    pembulatanInput.value = pembulatanInput.getAttribute('data-initial');
                    updateTotalAll(row);
                }
            });
        } else {
            updateTotalAll(row);
        }
    }
}

// Fungsi untuk memperbarui nilai totalall
function updateTotalAll(row) {
    var subtotal = parseFloat(row.querySelector('input[name="subtotal"]').value.replace(/[^,\d]/g, '').replace(',', '.')) || 0;
    var ppn = parseFloat(row.querySelector('input[name="ppn"]').value.replace(/[^,\d]/g, '').replace(',', '.')) || 0;
    var pembulatan = parseFloat(row.querySelector('input[name="pembulatan"]').value) || 0;
    var totalallInput = row.querySelector('input[name="totalall"]');

    var totalall = subtotal + ppn + pembulatan;

    totalallInput.value = formatRupiah(totalall.toFixed(2).replace('.', ','));
}




function savePo() {
    var tableRows = document.querySelectorAll('#poTableBody tr');
    var items = [];

    tableRows.forEach(function(row) {
        // Mengambil data dari elemen table row
                var tglfp = row.children[1].textContent.trim();
        var nopo = row.children[3].textContent.trim();
        var npwp = row.children[5].textContent.trim();

        // Mengambil dan memproses nilai input
        var subtotal = row.querySelector('input[name="subtotal"]').value.replace(/[^0-9,]/g, '');
        var ppn = row.querySelector('input[name="ppn"]').value.replace(/[^0-9,]/g, '');
        var pembulatan = row.querySelector('input[name="pembulatan"]').value;
        var totalall = row.querySelector('input[name="totalall"]').value.replace(/[^0-9,]/g, '');
        var nott = row.querySelector('input[name="nott"]').value.trim();
        var tglttin = row.querySelector('input[name="tglttin"]').value.trim();
        var noinvoice = row.querySelector('input[name="noinvoice"]').value.trim();
        var tglinvoice = row.querySelector('input[name="tglinvoice"]').value.trim();
        var tglttdate = row.querySelector('input[name="tglttdate"]').value.trim();

        var nofp = row.querySelector('input[name="nofp"]').value.trim();

        var namasuplier = row.querySelector('input[name="namasuplier"]').value.trim();

        subtotal = formatRupiah(subtotal);
        ppn = formatRupiah(ppn);
        totalall = formatRupiah(totalall);


        items.push({
            nofp: nofp,
            tglfp: tglfp,
            nopo: nopo,
            namasuplier: namasuplier,
            npwp: npwp,
            subtotal: subtotal,
            ppn: ppn,
            pembulatan: pembulatan,
            totalall: totalall,
            nott: nott,
            tglttin: tglttin,
            noinvoice: noinvoice,
            tglinvoice: tglinvoice,
            tglttdate: tglttdate
        });
    });

    // Kirim data ke server menggunakan fetch
    fetch('purchaselocal/save_ttfp.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items: items })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Data berhasil disimpan',
                timer: 2000, // Notifikasi ditampilkan selama 2 detik
                showConfirmButton: false,
                didClose: () => {
                    // Reload halaman setelah notifikasi ditutup
                    location.reload();
                }
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Terjadi kesalahan',
                text: data.message,
                confirmButtonText: 'OK'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            icon: 'error',
            title: 'Terjadi kesalahan',
            text: 'Tidak dapat menyimpan data.',
            confirmButtonText: 'OK'
        });
    });
}


function backToFirstModal() {
  $('#poModal').modal('hide');
  $('#exampleModalScrollable').modal('show');
}



$(document).ready(function() {
    // Handler untuk tombol Edit
    $(document).on('click', '.editButton', function() {
        var no = $(this).data('no');
        console.log(no); // Debug: Cek ID yang dikirimkan

        $('#no').val(no);

        $.ajax({
            url: 'purchaselocal/get_ttfp.php',
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
            url: 'purchaselocal/simpan_datattfp.php',
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



