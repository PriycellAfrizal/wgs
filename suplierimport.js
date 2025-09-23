         document.getElementById('telpInput').addEventListener('input', function (e) {
    // Hanya izinkan karakter yang cocok dengan pola
    this.value = this.value.replace(/[^0-9\-\(\) ]/g, '');
});

        function showHistory(id) {
                    // Mengirim permintaan Ajax ke server untuk mendapatkan tgl_in dan tgl_out
                    $.ajax({
                      type: "POST",
                      url: "purchaseimport/getHistorySuplierimport.php", // Ganti dengan nama file PHP yang akan menghandle permintaan ini
                      data: {
                        id: id
                      },
                      success: function(response) {
                        // Menampilkan modal dengan data yang diterima dari server
                        $('#historyModal').find('.modal-body').html(response);
                        $('#historyModal').modal('show');
                      },
                      error: function(xhr, status, error) {
                        console.error("Error:", error);
                      }
                    });
                  }

function editContact(id) {
    // Mengirim permintaan Ajax ke server untuk mendapatkan data supplier
    $.ajax({
        type: "POST",
        url: "purchaseimport/get_ContactEdit.php", // Ganti dengan nama file PHP yang akan menghandle permintaan ini
        data: {
            id: id
        },
        success: function(response) {
            // Menampilkan modal dengan data yang diterima dari server
            $('#editModal').find('.modal-body').html(response);
            $('#editModal').modal('show');
        },
        error: function(xhr, status, error) {
            console.error("Error:", error);
        }
    });
}
   $(document).on('submit', '#editForm', function(e) {
    e.preventDefault();

    $.ajax({
        type: "POST",
        url: "purchaseimport/update_Contact.php", 
        data: $(this).serialize(),
        dataType: "json", // ✅ pastikan hasil diparse ke JSON
        success: function(response) {
            if (response.status === "success") {
                alert(response.message); // ✅ tampilkan pesan sukses
                $('#editModal').modal('hide');
                location.reload();
            } else {
                alert("Error: " + response.message); // ✅ tampilkan pesan error
            }
        },
        error: function(xhr, status, error) {
            console.error("AJAX Error:", error);
            alert("Terjadi kesalahan saat menghubungi server.");
        }
    });
});


   $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 
        $('#dataTableHover').DataTable(); // ID From dataTable with Hover


    });

  

  

                 
        
function saveCustomer() {
    const form = document.getElementById('customerForm');
    const formData = new FormData(form);

    fetch('purchaseimport/save_customer.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            Swal.fire({
                title: 'Berhasil!',
                text: 'Data berhasil disimpan.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                // Refresh halaman setelah 2 detik
                location.reload();
            });
        } else {
            Swal.fire({
                title: 'Error!',
                text: data.message,
                icon: 'error'
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        Swal.fire({
            title: 'Error!',
            text: 'Terjadi kesalahan saat menyimpan data.',
            icon: 'error'
        });
    });
}
