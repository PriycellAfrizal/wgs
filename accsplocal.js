// ========================
// Checkbox Select All
// ========================
function toggleAllCheckboxes(isChecked) {
    const checkboxes = document.querySelectorAll('.select-row');
    checkboxes.forEach((checkbox) => {
        checkbox.checked = isChecked;
        toggleRowHighlight(checkbox.closest('tr'), checkbox.checked);
    });
    document.getElementById('select-all').checked = isChecked;
    document.getElementById('select-all-footer').checked = isChecked;
}

document.getElementById('select-all').addEventListener('click', function(e) {
    toggleAllCheckboxes(e.target.checked);
});
document.getElementById('select-all-footer').addEventListener('click', function(e) {
    toggleAllCheckboxes(e.target.checked);
});

// ========================
// Klik baris = toggle checkbox
// ========================
document.querySelectorAll('#datasp tbody tr').forEach(row => {
    row.addEventListener('click', function(event) {
        if (event.target.type !== "checkbox") { 
            const checkbox = this.querySelector('.select-row');
            checkbox.checked = !checkbox.checked;
            toggleRowHighlight(this, checkbox.checked);
            updateSelectAllStatus();
        }
    });
    row.style.cursor = 'pointer';
});

function toggleRowHighlight(row, isSelected) {
    row.style.backgroundColor = isSelected ? '#007bff' : '';
    row.style.color = isSelected ? 'white' : '';
}

function updateSelectAllStatus() {
    const checkboxes = document.querySelectorAll('.select-row');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    document.getElementById('select-all').checked = allChecked;
    document.getElementById('select-all-footer').checked = allChecked;
}

// ========================
// DataTables custom sort untuk kolom status
// ========================
$(document).ready(function () {
    $('#dataTable').DataTable({
        "order": [[6, 'asc']],
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
});

// ========================
// Update Status Button
// ========================
document.getElementById('updateStatusButton').addEventListener('click', function() {
    const selectedRows = document.querySelectorAll('.select-row:checked');
    if (selectedRows.length === 0) {
        Swal.fire('No Selection', 'Please select at least one row to update.', 'warning');
        return;
    }

    let selectedNosps = [];
    selectedRows.forEach(cb => selectedNosps.push(cb.value));

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
            fetch("updatestatussplocal.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nosp: selectedNosps })
            })
            .then(res => res.json())
            .then(data => {
                console.log("DEBUG response:", data);
                if (data.status === "success") {
                    Swal.fire({
                        title: 'Updated!',
                        html: '<b style="color: black;">' + data.message + '</b>',
                        icon: 'success',
                        timer: 3000,
                        showConfirmButton: false
                    }).then(() => location.reload());
                } else {
                    Swal.fire('Error!', data.message || 'Terjadi kesalahan', 'error');
                }
            })
            .catch(err => {
                console.error("Fetch error:", err);
                Swal.fire('Error!', 'Koneksi gagal ke server', 'error');
            });
        }
    });
});
