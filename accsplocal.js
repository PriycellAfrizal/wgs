// ==========================
// Select All Header & Footer
// ==========================
document.addEventListener("DOMContentLoaded", function () {
    const selectAllHeader = document.getElementById('select-all');
    const selectAllFooter = document.getElementById('select-all-footer');

    // Fungsi update highlight row
    function toggleRowHighlight(row, isSelected) {
        if (isSelected) {
            row.style.backgroundColor = '#007bff';
            row.style.color = 'white';
        } else {
            row.style.backgroundColor = '';
            row.style.color = '';
        }
    }

    // Sinkronkan status "select all"
    function updateSelectAllStatus() {
        const checkboxes = document.querySelectorAll('.select-row');
        const allChecked = Array.from(checkboxes).length > 0 &&
                           Array.from(checkboxes).every(cb => cb.checked);
        selectAllHeader.checked = allChecked;
        selectAllFooter.checked = allChecked;
    }

    // Event select-all header
    if (selectAllHeader) {
        selectAllHeader.addEventListener('change', function (e) {
            const isChecked = e.target.checked;
            document.querySelectorAll('.select-row').forEach(cb => {
                cb.checked = isChecked;
                toggleRowHighlight(cb.closest('tr'), isChecked);
            });
            selectAllFooter.checked = isChecked;
        });
    }

    // Event select-all footer
    if (selectAllFooter) {
        selectAllFooter.addEventListener('change', function (e) {
            const isChecked = e.target.checked;
            document.querySelectorAll('.select-row').forEach(cb => {
                cb.checked = isChecked;
                toggleRowHighlight(cb.closest('tr'), isChecked);
            });
            selectAllHeader.checked = isChecked;
        });
    }

    // Klik baris untuk toggle
    document.querySelectorAll('#datasp tbody tr').forEach(row => {
        row.addEventListener('click', function (e) {
            // Cegah dobel toggle kalau klik langsung checkbox
            if (e.target.classList.contains('select-row')) return;

            const checkbox = this.querySelector('.select-row');
            if (checkbox) {
                checkbox.checked = !checkbox.checked;
                toggleRowHighlight(this, checkbox.checked);
                updateSelectAllStatus();
            }
        });

        row.style.cursor = 'pointer';
    });

    // ==========================
    // DataTables Init
    // ==========================
    $('#dataTable').DataTable({
        "order": [[6, 'asc']], // urutkan by kolom status
        "columnDefs": [{
            "targets": [6],
            "orderData": [6],
            "render": function (data, type, row) {
                switch (data) {
                    case 'Pending Approved': return 1;
                    case 'Approval RND': return 2;
                    case 'PO ISSUED': return 3;
                    case 'Delivered': return 4;
                    default: return 5;
                }
            }
        }],
        "createdRow": function (row, data) {
            $(row).attr('data-original-status', data[6]);
        },
        "drawCallback": function () {
            $('#dataTable tbody tr').each(function () {
                var originalStatus = $(this).data('original-status');
                $(this).find('td:eq(6)').text(originalStatus);
            });
        }
    });

    // ==========================
    // Update Status Button
    // ==========================
   // ====== JS: updateStatusButton handler (modern, robust) ======
document.getElementById('updateStatusButton').addEventListener('click', async function() {
    // ambil semua checkbox yang ter-check
    const selectedRows = Array.from(document.querySelectorAll('.select-row:checked'));
    if (selectedRows.length === 0) {
        Swal.fire('No Selection', 'Please select at least one row to update.', 'warning');
        return;
    }

    const selectedNosps = selectedRows.map(cb => cb.value);

    // debug quick (cek di console apa yang akan dikirim)
    console.log('Will send nosps:', selectedNosps);

    const confirmed = await Swal.fire({
        title: 'Are you sure?',
        html: 'Do you want to approve the selected SP(s): <br><b style="color: black;">' + selectedNosps.join(', ') + '</b>?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, approve it!'
    });

    if (!confirmed.isConfirmed) return;

    try {
        const resp = await fetch('updatestatussplocal.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nosps: selectedNosps })
        });

        // jika server merespon bukan JSON, akan throw di json()
        const data = await resp.json();
        console.log('Server response:', data);

        if (data.status === 'success') {
            Swal.fire({
                title: 'Updated!',
                html: '<b style="color: black;">NO SP ' + selectedNosps.join(', ') + ' berhasil di Approved</b>',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => location.reload());
        } else {
            Swal.fire('Error!', data.message || 'Terjadi kesalahan', 'error');
        }
    } catch (err) {
        console.error('Fetch error:', err);
        Swal.fire('Error!', 'Gagal koneksi ke server atau response tidak valid.', 'error');
    }
});
