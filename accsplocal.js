// ========================
// Checkbox Select All
// ========================
function toggleAllCheckboxes(isChecked) {
    const checkboxes = document.querySelectorAll('.select-row');
    checkboxes.forEach(cb => {
        cb.checked = isChecked;
        toggleRowHighlight(cb.closest('tr'), cb.checked);
    });
    document.getElementById('select-all').checked = isChecked;
    document.getElementById('select-all-footer').checked = isChecked;
}

document.getElementById('select-all').addEventListener('click', e => toggleAllCheckboxes(e.target.checked));
document.getElementById('select-all-footer').addEventListener('click', e => toggleAllCheckboxes(e.target.checked));

// ========================
// Klik baris = toggle checkbox
// ========================
document.querySelectorAll('#datasp tbody tr').forEach(row => {
    row.addEventListener('click', function(e) {
        if (e.target.type !== "checkbox") {
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
// DataTables
// ========================
$(document).ready(function () {
    $('#dataTable').DataTable({
        "order": [[6, 'asc']],
        "columnDefs": [{
            "targets": [6],
            "orderData": [6],
            "render": function(data) {
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

    const selectedNosps = Array.from(selectedRows).map(cb => cb.value);

    Swal.fire({
        title: 'Confirm Approval',
        html: 'Do you want to approve the selected SP(s)?<br><b>' + selectedNosps.join(', ') + '</b>',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, approve!',
        cancelButtonText: 'Cancel',
    }).then(result => {
        if (!result.isConfirmed) return;

        const formData = new URLSearchParams();
        selectedNosps.forEach(n => formData.append('nosp[]', n));

        fetch('updatestatussplocal.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData.toString()
        })
        .then(res => res.json())
        .then(data => {
            console.log("DEBUG response:", data);

            // ======================== Alert baru
            let htmlMsg = '';
            if (data.updated && Object.keys(data.updated).length > 0) {
                htmlMsg += '<b>Updated:</b><br>';
                for (const [nosp, info] of Object.entries(data.updated)) {
                    htmlMsg += `NO SP ${nosp}: splocal(${info.splocal_affected}), splocalcopy(${info.splocalcopy_affected})<br>`;
                }
            }
            if (data.skipped && Object.keys(data.skipped).length > 0) {
                htmlMsg += '<br><b>Skipped:</b><br>';
                for (const [nosp, reason] of Object.entries(data.skipped)) {
                    htmlMsg += `NO SP ${nosp}: ${reason}<br>`;
                }
            }

            Swal.fire({
                title: data.status === 'success' ? 'Success' : 'Completed with errors',
                html: htmlMsg || data.message,
                icon: data.status === 'success' ? 'success' : 'warning',
                showConfirmButton: true
            }).then(() => location.reload());
        })
        .catch(err => {
            console.error(err);
            Swal.fire('Error', 'Connection to server failed', 'error');
        });
    });
});
