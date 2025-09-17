$(document).ready(function() {
    // ========================
    // Checkbox Select All
    // ========================
    function toggleAllCheckboxes(isChecked) {
        $('.select-row').each(function() {
            this.checked = isChecked;
            toggleRowHighlight($(this).closest('tr'), isChecked);
        });
        $('#select-all').prop('checked', isChecked);
        $('#select-all-footer').prop('checked', isChecked);
    }

    $('#select-all, #select-all-footer').on('click', function() {
        toggleAllCheckboxes(this.checked);
    });

    // ========================
    // Klik baris = toggle checkbox
    // ========================
    $('#datasp tbody tr').on('click', function(e) {
        if (e.target.type !== 'checkbox') {
            const cb = $(this).find('.select-row');
            cb.prop('checked', !cb.prop('checked'));
            toggleRowHighlight($(this), cb.prop('checked'));
            updateSelectAllStatus();
        }
    });

    function toggleRowHighlight(row, selected) {
        if(selected){
            row.css({'background-color':'#007bff','color':'white'});
        }else{
            row.css({'background-color':'','color':''});
        }
    }

    function updateSelectAllStatus() {
        const allChecked = $('.select-row').length === $('.select-row:checked').length;
        $('#select-all, #select-all-footer').prop('checked', allChecked);
    }

    // ========================
    // DataTables
    // ========================
    $('#dataTable').DataTable({
        "order": [[6,'asc']],
        "columnDefs":[{
            "targets": [6],
            "render": function(data,type,row){
                switch(data){
                    case 'Pending Approved': return 1;
                    case 'Approval RND': return 2;
                    case 'PO ISSUED': return 3;
                    case 'Delivered': return 4;
                    default: return 5;
                }
            }
        }],
        "createdRow": function(row,data){
            $(row).attr('data-original-status',data[6]);
        },
        "drawCallback": function(){
            $('#dataTable tbody tr').each(function(){
                $(this).find('td:eq(6)').text($(this).data('original-status'));
            });
        }
    });

    // ========================
    // Update Status Button
    // ========================
    $('#updateStatusButton').on('click', function() {
        const selectedNosps = $('.select-row:checked').map(function(){ return this.value; }).get();
        if(selectedNosps.length === 0){
            Swal.fire('No Selection','Please select at least one row','warning');
            return;
        }

        Swal.fire({
            title:'Confirm Approve',
            html:'Approve SP(s): <b style="color:black;">'+selectedNosps.join(', ')+'</b>?',
            icon:'warning',
            showCancelButton:true,
            confirmButtonColor:'#3085d6',
            cancelButtonColor:'#d33',
            confirmButtonText:'Yes'
        }).then((result)=>{
            if(result.isConfirmed){
                $.post('updatestatussplocal.php',{nosp:selectedNosps},function(res){
                    console.log(res);
                    if(res.status==='success'){
                        let message = `Updated: ${Object.keys(res.updated).length} | Skipped: ${Object.keys(res.skipped).length}`;
                        Swal.fire('Done', message,'success').then(()=>location.reload());
                    }else{
                        Swal.fire('Error', res.message,'error');
                    }
                },'json').fail(function(){ Swal.fire('Error','Server error','error'); });
            }
        });
    });
});
