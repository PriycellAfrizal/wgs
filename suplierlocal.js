        function showHistory(id) {
                    // Mengirim permintaan Ajax ke server untuk mendapatkan tgl_in dan tgl_out
                    $.ajax({
                      type: "POST",
                      url: "purchaselocal/get_HistorySuplierLocal.php", // Ganti dengan nama file PHP yang akan menghandle permintaan ini
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

   $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 
        $('#dataTableHover').DataTable(); // ID From dataTable with Hover



    });

  

  function addContact() {
    var contactRow = '<div class="form-group row custom-form-group added-row">' +
                      '<label for="telpInput" class="col-sm-3 col-form-label">Contact Person </label>' +
                      '<div class="col-sm-8">' +
                        '<input type="text" class="form-control" name="cp[]" required>' +
                      '</div>' +
                    '</div>' +
                    '<div class="form-group row custom-form-group added-row">' +
                      '<label for="telpInput" class="col-sm-3 col-form-label">Mobile Person</label>' +
                      '<div class="col-sm-8">' +
                        '<input type="text" class="form-control" name="hp[]" required pattern="[0-9]{11}">' +
                      '</div>' +
                    '</div>';

    // Append the new contact row to the form
    document.getElementById('customerForm').insertAdjacentHTML('beforeend', contactRow);
  }

  function deleteRow() {
    var form = document.getElementById('customerForm');
    var addedRows = form.querySelectorAll('.added-row'); // Select all rows with class 'added-row'

    // Remove all added contact rows (cp and hp)
    for (var i = 0; i < addedRows.length; i++) {
      addedRows[i].parentNode.removeChild(addedRows[i]);
    }
  }

  
// Handler untuk input hp dan hpedit
document.querySelectorAll('#hp, #hpedit').forEach(item => {
    item.addEventListener('input', function (e) {
        this.value = this.value.replace(/\D/g, ''); // Hanya izinkan angka
        if (this.value.length > 13) {
            this.value = this.value.slice(0, 13); // Batasi panjang input menjadi maksimal 13 karakter
        }
    });
});








document.getElementById('telpInput').addEventListener('input', function (e) {
    // Hanya izinkan angka dan karakter khusus (/ .)
    this.value = this.value.replace(/[^0-9./-]/g, '');

    // Batasi panjang input menjadi 16 karakter (e.g., 021-xxxx-xxxx atau 08xx-xxxx-xxxx)
    if (this.value.length > 50) {
        this.value = this.value.slice(0, 50);
    }

    // Validasi pola menggunakan RegExp
    var pattern = /^(\d{3}-\d{4}-\d{4}|\d{4}\/\d{5,10})$/;

    if (!pattern.test(this.value)) {
        errorMessage.textContent = 'Format should be xxx-xxxx-xxxx or xxxx/xxxxx(x)';
    } else {
        errorMessage.textContent = '';
    }
});

// Handler untuk input npwpInput dan npwpedit
document.querySelectorAll('#npwpInput, #npwpedit').forEach(item => {
    item.addEventListener('input', function () {
        // Menghapus karakter selain digit
        var inputValue = this.value.replace(/\D/g, "");

        // Menambahkan titik dan strip pada posisi yang benar
        if (inputValue.length >= 2) {
            inputValue = inputValue.substring(0, 2) + "." + inputValue.substring(2);
        }
        if (inputValue.length >= 6) {
            inputValue = inputValue.substring(0, 6) + "." + inputValue.substring(6);
        }
        if (inputValue.length >= 10) {
            inputValue = inputValue.substring(0, 10) + "." + inputValue.substring(10, 12) + "-" + inputValue.substring(12);
        }

        // Memasukkan hasil format kembali ke input
        this.value = inputValue;
    });
});

function validateForm() {
    var isValid = true;

    // Check if each input field is filled except for NPWP and Notes
    $('#customerForm input, #customerForm textarea, #customerForm select').each(function() {
        var fieldValue = $(this).val().trim();

        // Skip hidden fields
        if ($(this).is(':hidden')) {
            return;
        }

        // Skip NPWP and Notes fields
        if ($(this).attr('name') === 'npwp' || $(this).attr('name') === 'notes') {
            return;
        }

        if (fieldValue === '') {
            // Display an alert if any required field is empty
            alert('Please fill in all required fields.');
            isValid = false;
            return false; // Exit the loop early if any required field is empty
        }
    });

    return isValid;
}

function saveCustomer() {
    // Validate form inputs
    if (!validateForm()) {
        // Validation failed, do not proceed with saving
        return;
    }

    // Get form data
    var formData = new FormData(document.getElementById('customerForm'));

    // Make an AJAX request to save customer data
    $.ajax({
        type: 'POST',
        url: 'purchaselocal/save_suplier.php', // Replace with your actual endpoint
        data: formData,
        processData: false,
        contentType: false,
        success: function(response) {
            // Handle success, e.g., show a success message
            alert('Suplier data saved successfully!');
            // You may want to close the modal or perform other actions

            $('#exampleModalScrollable').modal('hide');
            location.reload();
        },
        error: function(error) {
            // Handle error, e.g., show an error message
            alert('Error saving suplier data. Please try again.');
        }
    });
}


$(document).ready(function() {
    // Handler untuk tombol Edit
    $(document).on('click', '.editButton', function() {
        var id = $(this).data('id');
        console.log(id); // Debug: Cek ID yang dikirimkan

        $('#id').val(id);

        $.ajax({
            url: 'purchaselocal/get_datasuplier.php',
            type: 'GET',
            data: { id: id },
            dataType: 'json',
            success: function(response) {
                console.log(response); // Debug: Cek respons dari server

                if (response.error) {
                    console.error('Error:', response.error);
                    alert(response.error);
                } else {
                    // Isi modal dengan data yang diambil
                    $('#namasuplieredit').val(response.namasuplier);
                    $('#hpedit').val(response.hp);
                    $('#emailedit').val(response.email);
                    $('#npwpedit').val(response.npwp);

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
            url: 'purchaselocal/simpan_datasuplier.php',
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
