                          

  // Initialize Select2 for the newly added kodeproduksi select element
  setTimeout(function () {
    $('.kodeproduksi').select2({
      ajax: {
        url: 'get_kodeproduksi.php', // Change the URL accordingly
        dataType: 'json',
        delay: 250,
        processResults: function(data) {
          return {
            results: data
          };
        },
        cache: true
      },
      language: {
        searching: function() {
          return 'Searching...';
        }
      },
      placeholder: 'Cari kodeproduksi...',
      minimumInputLength: 0,
      allowClear: true,
      formatNoMatches: function() {
        return 'Tidak ditemukan hasil';
      }
    });
  }, 0);          


           function showHistory(nosp) {
                    // Mengirim permintaan Ajax ke server untuk mendapatkan tgl_in dan tgl_out
                    $.ajax({
                      type: "POST",
                      url: "get_Historysp.php", // Ganti dengan nama file PHP yang akan menghandle permintaan ini
                      data: {
                        nosp: nosp
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



       function fetchKodeBarang() {
              // Get the selected nama barang
              var selectedNamabarang = $("#namabarang").val();

              // Make an AJAX request to get the corresponding kodebarang
              $.ajax({
                type: "GET",
                url: "get_kodebarang.php", // Replace with the actual server-side script to handle the data
                data: {
                  namabarang: selectedNamabarang
                },
                dataType: 'json',
                success: function(response) {
                  // Update the hidden input field with the fetched kodebarang
                  $("#kodebarang").val(response.kodebarang);

                },
                error: function(error) {
                  // Handle errors, if any
                  console.error(error);
                }
              });
            }
            
function saveAllData() {
    var rows = document.querySelectorAll("#tableBody tr");

    // Create an array to store the data
    var data = [];

    // Get the tgl value
    var tglValue = document.getElementById("tgl").value;

    // Flag to check if validation passes
    var isValid = true;

    // Flag to check if alert has been shown
    var alertShown = false;

    // Loop through each row in the table
    rows.forEach(function (row) {

        var noUnit = row.cells[0].querySelector("input").value;
        var kodeProduksi = row.cells[1].querySelector("input").value;
        var tipeProduksi = row.cells[2].querySelector("select").value; // Correctly select the value from the <select> element

        // Check if kodeProduksi and tipeProduksi are not empty
        if (kodeProduksi.trim() === '' || tipeProduksi.trim() === '') {
            isValid = false;

            // Show alert only if it hasn't been shown before
            if (!alertShown) {
                alert("Please fill in all required fields for each row before saving.");
                alertShown = true; // Set the flag to true to prevent showing the alert again
            }

            return; // Stop further processing
        }

        var rowData = {
            nounit: noUnit,
            kodeProduksi: kodeProduksi,
            tipeProduksi: tipeProduksi
        };

        // Add the row data to the array
        data.push(rowData);
    });

    // Check if validation passed before sending the data
    if (isValid) {
        // Send the 'data' array to the server using AJAX
        $.ajax({
            type: "POST",
            url: "produksi/savehiblow.php",
            data: { data: data, tgl: tglValue }, // Include tgl in the data sent to the server
            dataType: 'json',
            success: function (response) {
                // Handle the server response
                console.log(response);

                // Display success message
                alert("Data saved successfully!");

                // Reload the page or perform any other action
                location.reload();
            },
            error: function (error) {
                // Handle errors
                console.error(error);
                alert("An error occurred while saving data. Please try again later.");
            }
        });
    }
}


  $(document).ready(function () {
    // Inisialisasi Select2
    $('.divisi').select2({
      ajax: {
        url: 'get_divisi.php',
        dataType: 'json',
        delay: 250,
        processResults: function (data) {
          return {
            results: data
          };
        },
        cache: true
      },
      language: {
        searching: function () {
          return 'Searching...';
        }
      },
      placeholder: 'Search Divisi...',
      minimumInputLength: 0, // Allow search with an empty input
      allowClear: true,
      escapeMarkup: function (markup) {
        return markup;
      }, // Let our custom formatter work
      templateResult: function (data) {
        // Customize the appearance of the results
        if (data.loading) {
          return 'Searching...';
        }

        return data.text;
      },
      templateSelection: function (data) {
        // Customize the appearance of the selected option
        return data.text || 'Search Divisi...';
      }
    });
  });






function addRowToModal() {
  // Mendapatkan elemen tabel dan jumlah baris saat ini
  var tableBody = document.getElementById("tableBody");
  var rowCount = tableBody.rows.length;

  // Menambah baris baru
  var row = tableBody.insertRow(rowCount);

  // Increment urutan terbesar untuk nosp
  urutanTerbesar++;

var nospValue = "WHB" + tahunSekarang + "/" + urutanTerbesar;


var uniqueIdKodeProduksi = 'kodeproduksi_' + rowCount;


  // Generate a unique ID for each select element
  var uniqueIdNamabarang = 'namabarang_' + tableBody.rows.length;
  var uniqueIdDivisi = 'divisi_' + tableBody.rows.length;
  var uniqueIdKodeProduksi = 'kodeproduksi_' + tableBody.rows.length;



  // Mengisi sel-sel dalam baris baru
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);

 cell1.innerHTML = '<input readonly type="text" name="nounit[]" value="' + nospValue + '" class="nosp form-control form-control-sm mb-3">'; // Nosp
  

  cell2.innerHTML = '<input readonly type="text" name="nounit[]" value="' + nospValue + '" class="nosp form-control form-control-sm mb-3">'; // Nosp
  

  cell3.innerHTML = '<select id="namabarang_' + rowCount + '" name="namabarang[]" class="namabarang dynamic-select" style="width: 500px; font-size: 14px; height: 34px;" required data-placeholder="Search Items Name ..." onchange="updateSatuan($(this))"></select>';


 // Initialize Select2 for the newly added kodeproduksi select element
  $("#kodeproduksi_" + rowCount).select2({
    ajax: {
      url: 'get_kodeproduksi.php', // Change the URL accordingly
      dataType: 'json',
      delay: 250,
      processResults: function(data) {
        return {
          results: data
        };
      },
      cache: true
    },
    language: {
      searching: function() {
        return 'Searching...';
      }
    },
    placeholder: 'Cari kodeproduksi...',
    minimumInputLength: 0,
    allowClear: true,
    formatNoMatches: function() {
      return 'Tidak ditemukan hasil';
    }
  });

  // Event listener for changes in kodeproduksi
  $("#kodeproduksi_" + rowCount).on('change', function() {
    // Get the selected kodeproduksi
    var selectedKodeProduksi = $(this).val();

    // Make an AJAX request to get the corresponding SPK
    $.ajax({
      type: "GET",
      url: "get_spk.php", // Replace with the actual server-side script to handle the data
      data: { kodeproduksi: selectedKodeProduksi },
      dataType: 'json',
      success: function(response) {
        // Update the SPK field for the current row
        $("#spk_" + rowCount).val(response.spk);
      },
      error: function(error) {
        // Handle errors, if any
        console.error(error);
      }
    });
  });




// Function to fetch SPK based on selected kodeproduksi
function carispk(selectElement) {
    // Get the selected kodeproduksi
    var selectedKodeProduksi = $(selectElement).val();

    // Make an AJAX request to get the corresponding SPK
    $.ajax({
        type: "GET",
        url: "get_spk.php", // Replace with the actual server-side script to handle the data
        data: { kodeproduksi: selectedKodeProduksi },
        dataType: 'json',
        success: function(response) {
            // Update the SPK field for the current row
            $(selectElement).closest('tr').find('.spk').val(response.spk);
        },
        error: function(error) {
            // Handle errors, if any
            console.error(error);
        }
    });
}



  // Initialize Select2 for the newly added dynamic-select elements
  $(".dynamic-select").select2({
    ajax: {
      // Your AJAX settings for namabarang
      url: 'get_namabaranghiblow.php',
      dataType: 'json',
      delay: 250,
      processResults: function(data) {
        return {
          results: data
        };
      },
      cache: true
    },


  });


// Function to update satuan when namabarang changes
function updateSatuan(selectElement) {
  // Get the selected value
  var namabarang = selectElement.val();

  // Log the value of namabarang to the console
  console.log('Sending AJAX request with namabarang:', namabarang);

  // Send AJAX request to the PHP script to get satuan
  $.ajax({
    url: 'get_satuandata.php', // Adjust the URL based on your server-side script
    method: 'GET',
    dataType: 'json',
    data: {
      namabarang: namabarang
    },
    success: function(response) {
      // Update the satuan column value for the current row
      var row = selectElement.closest('tr');
      row.find('.satuan').val(response.satuan);
    },
    error: function() {
      // Handle errors if the request fails
      console.log('Failed to fetch satuan data');
    }
  });
}


  

  // Initialize Select2 for divisi
  $("#divisi_" + rowCount).select2({
    ajax: {
      url: 'get_divisi.php',
      dataType: 'json',
      delay: 250,
      processResults: function(data) {
        return {
          results: data
        };
      },
      cache: true
    },
    // Your other settings for divisi
  });
}

// Function to update satuan when namabarang changes
function updateSatuan(selectElement) {
  // Get the selected value
  var namabarang = selectElement.val();


  // Log the value for debugging
  console.log('Sending AJAX request with namabarang:', namabarang);

  // Send AJAX request to the PHP script to get satuan
  $.ajax({
    url: 'get_satuandata.php', // Adjust the URL based on your server-side script
    method: 'GET',
    dataType: 'json',
    data: {
      namabarang: namabarang
    },
    success: function(response) {
      // Update the satuan column value for the current row
      var row = selectElement.closest('tr');
      row.find('.satuanadd').val(response.satuan);
    },
    error: function() {
      // Handle errors if the request fails
      console.log('Failed to fetch satuan data');
    }
  });
}


function carispk(selectElement) {
    // Get the selected kodeproduksi
    var selectedKodeProduksi = $(selectElement).val();

    // Make an AJAX request to get the corresponding SPK
    $.ajax({
        type: "GET",
        url: "get_spk.php", // Replace with the actual server-side script to handle the data
        data: { kodeproduksi: selectedKodeProduksi },
        dataType: 'json',
        success: function(response) {
            // Update the SPK field for the current row
            $(selectElement).closest('tr').find('.nospk').val(response.spk);
        },
        error: function(error) {
            // Handle errors, if any
            console.error(error);
        }
    });
}




  function deleteRow() {
    var table = document.querySelector(".table-sp tbody");
    if (table.rows.length > 1) {
      table.deleteRow(table.rows.length - 1);
    }
  }

  function saveChanges() {
    // Add your logic to save changes here
  }


            $(document).ready(function() {
              // Inisialisasi Select2
              $('.namabarang').select2({
                ajax: {
                  url: 'get_namabaranghiblow.php',
                  dataType: 'json',
                  delay: 250,
                  processResults: function(data) {
                    return {
                      results: data
                    };
                  },
                  cache: true
                },
                language: {
                  searching: function() {
                    return 'Mencari...';
                  }
                },




                placeholder: 'Cari nama barang...',
                minimumInputLength: 0, // Allow search with an empty input
                allowClear: true,
                formatNoMatches: function() {
                  return 'Tidak ditemukan hasil';
                }
              });



              // Menambahkan event listener untuk menangani perubahan nilai pada Select2
              $('.namabarang').on('change', function() {
                // Mendapatkan elemen terpilih
                var selectedElement = $('.namabarang').find(':selected');

                // Memperbarui warna teks menjadi hitam
                selectedElement.css('color', 'black');

                // Mendapatkan nilai yang dipilih
                var namabarang = $(this).val();

                // Mengirimkan permintaan AJAX ke skrip PHP untuk mendapatkan satuan
                $.ajax({
                  url: 'get_satuan.php', // Adjust the URL based on your server-side script
                  method: 'GET',
                  dataType: 'json',
                  data: {
                    namabarang: namabarang
                  },
                  success: function(response) {
                    // Memperbarui nilai kolom satuan
                    $('.satuan').val(response.satuan);
                  },
                  error: function() {
                    // Handle kesalahan jika permintaan gagal
                    console.log('Gagal mengambil data satuan');
                  }
                });
              });
            });


