
   $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 
        $('#dataTableHover').DataTable(); // ID From dataTable with Hover
        





    });

    function sortTable() {
    let table = document.getElementById("dataTable");
    let tbody = table.querySelector("tbody");
    let rows = Array.from(tbody.rows); // Mengambil semua baris dari tbody

    // Memisahkan baris dengan statuspayment kosong dan tidak kosong
    let emptyStatusRows = rows.filter(row => row.cells[1].innerText.trim() === '');
    let nonEmptyStatusRows = rows.filter(row => row.cells[1].innerText.trim() !== '');

    // Mengurutkan kedua kategori berdasarkan nott (kolom ketiga)
    emptyStatusRows.sort((rowA, rowB) => {
        let nottA = rowA.cells[2].innerText.trim();
        let nottB = rowB.cells[2].innerText.trim();
        return nottA.localeCompare(nottB); // Ascending order
    });

    nonEmptyStatusRows.sort((rowA, rowB) => {
        let nottA = rowA.cells[2].innerText.trim();
        let nottB = rowB.cells[2].innerText.trim();
        return nottA.localeCompare(nottB); // Ascending order
    });

    // Menggabungkan kembali baris yang kosong dan tidak kosong
    let sortedRows = [...emptyStatusRows, ...nonEmptyStatusRows];

    // Menambahkan kembali baris yang telah diurutkan ke tbody
    tbody.innerHTML = ''; // Kosongkan tbody terlebih dahulu
    sortedRows.forEach(row => tbody.appendChild(row)); // Tambahkan baris yang sudah diurutkan
}

// Panggil fungsi sortTable() ketika halaman dimuat
window.onload = sortTable;


$(document).ready(function() {
    $('.update-status').click(function() {
        var nott = $(this).data('nott');
        var nopo = $(this).data('nopo');

        var no = $(this).data('no');


        var totalall = $(this).data('totalall');


        // Mengonfirmasi tindakan pengguna dengan SweetAlert
        Swal.fire({
            title: 'Konfirmasi',
   html: 'Yakin ingin ACC <strong>No. PO ' + nopo + '</strong> dengan <strong>No. T.T. ' + nott + '</strong>? <br>Senilai <strong>' + totalall + '</strong>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, perbarui!',
            cancelButtonText: 'Tidak'
        }).then((result) => {
            if (result.isConfirmed) {
                // Jika pengguna mengonfirmasi, kirim AJAX
                $.ajax({
                    url: 'update_statuspayment.php',
                    type: 'POST',
                    data: {
                        nott: nott,
                        nopo: nopo,
                        no:no
                    },
                    success: function(response) {
                        // Tampilkan notifikasi sukses menggunakan SweetAlert
                        Swal.fire({
                            title: 'Berhasil!',
                            text: response,
                            icon: 'success',
                            timer: 2000, // Menetapkan timer selama 2 detik
                            timerProgressBar: true,
                            willClose: () => {
                                // Me-refresh halaman setelah timer berakhir
                                location.reload();
                            }
                        });
                    },
                    error: function() {
                        // Tampilkan notifikasi kesalahan menggunakan SweetAlert
                        Swal.fire({
                            title: 'Kesalahan!',
                            text: 'Terjadi kesalahan saat memperbarui status.',
                            icon: 'error'
                        });
                    }
                });
            }
        });
    });
});
