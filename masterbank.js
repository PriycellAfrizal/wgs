$(document).ready(function () {
    $('#myTable').DataTable(); 
    $('#dataTable').DataTable(); 
    $('#dataTableHover').DataTable(); 
});

document.getElementById('saveBank').addEventListener('click', function () {
    var namabank = document.getElementById('namabank').value;

    if (namabank === '') {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Nama Bank tidak boleh kosong!',
        });
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '../finance2/simpanmasterbank.php', true); // cukup ini karena file ada di folder yang sama
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            try {
                var response = JSON.parse(xhr.responseText);
                if (response.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Berhasil!',
                        text: 'Nama Bank berhasil disimpan.',
                        showConfirmButton: false,
                        timer: 2000
                    }).then(function () {
                        location.reload();
                    });
                    $('#exampleModalLong').modal('hide');
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Oops...',
                        text: response.message || 'Terjadi kesalahan, coba lagi.',
                    });
                }
            } catch (e) {
                console.error("Respon bukan JSON:", xhr.responseText);
            }
        }
    };

    xhr.send('namabank=' + encodeURIComponent(namabank));
});
