
document.getElementById('select-all').addEventListener('click', function(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('.select-row');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
        toggleRowHighlight(checkbox.closest('tr'), checkbox.checked);
    });
    // Sinkronkan status footer checkbox
    document.getElementById('select-all-footer').checked = isChecked;
});

document.getElementById('select-all-footer').addEventListener('click', function(event) {
    const isChecked = event.target.checked;
    const checkboxes = document.querySelectorAll('.select-row');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
        toggleRowHighlight(checkbox.closest('tr'), checkbox.checked);
    });
    // Sinkronkan status header checkbox
    document.getElementById('select-all').checked = isChecked;
});

// Menambahkan event listener ke setiap baris untuk mengubah warna saat diklik
document.querySelectorAll('#datasp tbody tr').forEach(row => {
    row.addEventListener('click', function(event) {
        const checkbox = this.querySelector('.select-row');
        checkbox.checked = !checkbox.checked; // Toggle checkbox
        toggleRowHighlight(this, checkbox.checked); // Ubah warna baris
        // Update Select All checkboxes status based on individual selections
        updateSelectAllStatus();
    });

    // Mengubah kursor menjadi pointer saat diarahkan ke baris
    row.style.cursor = 'pointer';
});

function toggleRowHighlight(row, isSelected) {
    if (isSelected) {
        row.style.backgroundColor = '#007bff'; // Warna biru primer
        row.style.color = 'white'; // Warna teks menjadi putih agar terbaca
    } else {
        row.style.backgroundColor = ''; // Kembali ke warna asli jika tidak terpilih
        row.style.color = ''; // Kembali ke warna teks asli
    }
}

function updateSelectAllStatus() {
    const checkboxes = document.querySelectorAll('.select-row');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    document.getElementById('select-all').checked = allChecked;
    document.getElementById('select-all-footer').checked = allChecked;
}

$(document).ready(function () {
    $('#dataTable').DataTable({
        "order": [
            [6, 'asc'], // Order by the 'status' column in ascending order
        ],
        "columnDefs": [
            {
                "targets": [6], // Target the 'status' column
                "orderData": [6], // Use the 'status' column for ordering
                "render": function (data, type, row) {
                    // Define custom ordering based on your status values
                    switch (data) {
                        case 'Pending Approved':
                            return 1;
                        case 'Approval RND':
                            return 2;
                        case 'PO ISSUED':
                            return 3;
                        case 'Delivered':
                            return 4;
                        default:
                            return 5;
                    }
                }
            }
        ],
        "createdRow": function (row, data, dataIndex) {
            // Add a data attribute to store the original status for display
            $(row).attr('data-original-status', data[6]);
        },
        "drawCallback": function () {
            // Update the display of the status column after DataTables has been drawn
            $('#dataTable tbody tr').each(function () {
                var originalStatus = $(this).data('original-status');
                $(this).find('td:eq(6)').text(originalStatus);
            });
        }
    });
});

document.getElementById('updateStatusButton').addEventListener('click', function() {
    // Ambil semua checkbox yang dipilih
    const selectedRows = document.querySelectorAll('.select-row:checked');
    if (selectedRows.length === 0) {
        Swal.fire('No Selection', 'Please select at least one row to update.', 'warning');
        return;
    }

    // Buat array untuk menyimpan semua nosp yang dipilih
    let selectedNosps = [];
    selectedRows.forEach((checkbox) => {
        selectedNosps.push(checkbox.value);
    });

    // Konfirmasi dengan SweetAlert
    Swal.fire({
        title: 'Are you sure?',
        html: 'Do you want to approve the selected SP(s): <br><b style="color: black;">' + selectedNosps.join(', ') + '</b>?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve it!'
    }).then((result) => {
        if (result.isConfirmed) {
            // Kirim data ke server menggunakan AJAX
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "updatestatussplocal.php", true);
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    if (xhr.responseText.includes("successfully")) {
                        Swal.fire({
                            title: 'Updated!',
                            html: '<b style="color: black;">NO SP ' + selectedNosps.join(', ') + ' berhasil di Approved</b>',
                            icon: 'success',
                            timer: 3000,  // Durasi notifikasi (3 detik)
                            showConfirmButton: false
                        }).then(() => {
                            location.reload();  // This will refresh the page
                        });
                    } else {
                        Swal.fire(
                            'Error!',
                            xhr.responseText,
                            'error'
                        );
                    }
                }
            };
            // Mengirimkan nosp yang dipilih ke server
            xhr.send("nosp=" + selectedNosps.join(','));
        }
    });
});

