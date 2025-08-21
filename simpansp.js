            $(document).ready(function () {
    $('#kodeproduksi').select2({
        ajax: {
            url: 'warehouse/get_kodeproduksi.php',
            dataType: 'json',
            delay: 250,
            processResults: function (data) {
                console.log(data); // Log the received data to the console
                return {
                    results: data
                };
            },
            cache: true
        },
        language: {
            searching: function () {
                return 'Mencari...';
            }
        },
        placeholder: 'Cari...',
        minimumInputLength: 0,
        allowClear: true,
        formatNoMatches: function () {
            return 'Tidak ditemukan hasil';
        }
    });
});

    $(document).ready(function() {
        $('#spk').select2({
            ajax: {
                url: 'warehouse/get_spkkk.php',
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
            placeholder: 'Cari SPK...',
            minimumInputLength: 0,
            allowClear: true,
            formatNoMatches: function() {
                return 'Tidak ditemukan hasil';
            }
        });

        var inputKodeProduksi = document.getElementById('kodeproduksi');
        var inputSPK = document.getElementById('spk');

        $('#spk').on('change', function(e) {
            if (inputSPK.value !== '') {
                inputKodeProduksi.disabled = true;
            } else {
                inputKodeProduksi.disabled = false;
            }
        });

        $('#kodeproduksi').on('change', function(e) {
            if (inputKodeProduksi.value !== '') {
                inputSPK.disabled = true;
            } else {
                inputSPK.disabled = false;
            }
        });
    });



           function showHistory(nosp) {
                    // Mengirim permintaan Ajax ke server untuk mendapatkan tgl_in dan tgl_out
                    $.ajax({
                      type: "POST",
                      url: "warehouse/get_Historysp.php", // Ganti dengan nama file PHP yang akan menghandle permintaan ini
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
                url: "warehouse/get_kodebaranglocal.php", // Replace with the actual server-side script to handle the data
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
    var date = document.getElementById("tglsp").value;
    var status = document.getElementById("status").value;
    var rows = document.querySelectorAll("#tableBody tr");
    var data = [];
    var isValid = true;
    var alertShown = false;

    for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        var spNumber = row.cells[1].querySelector("input").value;
        var itemName = row.cells[2].querySelector("select").value;
        var unit = row.cells[3].querySelector("input").value;
        var stock = row.cells[4].querySelector("input").value;
        var quantity = row.cells[5].querySelector("input").value;
        var divisi = row.cells[6].querySelector("select").value;
        var kodeProduksi = row.cells[7].querySelector("select").value;
        var spk = row.cells[8].querySelector("select").value;
        var remarks = row.cells[9].querySelector("textarea").value;


      

        // Check if either kodeProduksi or spk is not empty
      
        if (!(kodeProduksi.trim() || spk.trim() || divisi.trim())) {
        isValid = false;


            if (!alertShown) {
                alert("Kode Produksi atau SPK atau DIVISI harus di Lengkapi");
                alertShown = true;
            }
            break; // Stop further checking once one row is invalid
        }





        // Check other required fields
        if (spNumber.trim() === '' || itemName.trim() === '' || unit.trim() === '' || stock.trim() === '' || 
            quantity.trim() === '' || divisi.trim() === '' || remarks.trim() === '') {
            isValid = false;
            if (!alertShown) {
                alert("Please fill in all required fields for each row before saving.");
                alertShown = true;
            }
            break; // Stop further checking once one row is invalid
        }

        var rowData = {
            spNumber: spNumber,
            itemName: itemName,
            unit: unit,
            stock: stock,
            quantity: quantity,
            divisi: divisi,
            kodeProduksi: kodeProduksi,
            spk: spk,
            remarks: remarks
        };

        data.push(rowData);
    }

  // Check if validation passed before sending the data
  if (isValid) {
    // Now you can send the 'data' array to your server using AJAX or any other method
    // Example using AJAX and assuming you have jQuery available
    $.ajax({
      type: "POST",
      url: "warehouse/savesp.php", // Change this to your server-side script
      data: { date: date, rows: data },
      success: function (response) {
        // Handle the server response
        console.log(response);

        // Display success message
        alert("Data saved successfully!");

        // Reload the page
        location.reload();
      },
      error: function (error) {
        // Handle errors
        console.error(error);
      },
    });
  }
}



  $(document).ready(function () {
    // Inisialisasi Select2
    $('.divisi').select2({
      ajax: {
        url: 'warehouse/get_divisi.php',
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




$(document).ready(function () {
    // Initialize Select2 elements for the static elements
    initializeSelect2('#kodeproduksi', 'warehouse/get_kodeproduksi.php', 'Cari...');
    initializeSelect2('#spk', 'warehouse/get_spkkk.php', 'Cari SPK...');
    initializeSelect2('.divisi', 'warehouse/get_divisi.php', 'Search Divisi...');

    toggleInputState('#spk', '#kodeproduksi');
    toggleInputState('#kodeproduksi', '#spk');

    // Initialize Select2 for existing namabarang elements
    $('.namabarang').each(function () {
        initializeSelect2(this, 'warehouse/get_namabaranglocal.php', 'Cari nama barang...');
        updateSatuanAndStockOnChange(this);
    });

    // Add row button event listener
    $('#addRowButton').on('click', function () {
        addRowToModal();
    });

    // Delete row button event listener
    $('#deleteRowButton').on('click', function () {
        deleteRow();
    });
});

function initializeSelect2(selector, url, placeholder) {
    $(selector).select2({
        ajax: {
            url: url,
            dataType: 'json',
            delay: 250,
            processResults: function (data) {
                return { results: data };
            },
            cache: true
        },
        language: {
            searching: function () {
                return 'Mencari...';
            }
        },
        placeholder: placeholder,
        minimumInputLength: 0,
        allowClear: true,
        formatNoMatches: function () {
            return 'Tidak ditemukan hasil';
        }
    });
}

function toggleInputState(selector, dependentSelector) {
    $(selector).on('change', function () {
        $(dependentSelector).prop('disabled', $(this).val() !== '');
    });
}


function addRowToModal() {
    var tableBody = $("#tableBody");
    var rowCount = tableBody[0].rows.length;

    // Cek nilai nosp terakhir di tabel jika ada
    if (rowCount > 0) {
        var lastNosp = parseInt($("input[name='nosp[]']").last().val()) || 0;
        urutanTerbesar = lastNosp; // Pastikan urutan terbaru selalu diperbarui
    } else if (typeof urutanTerbesar === "undefined") {
        urutanTerbesar = 0; // Default jika tidak ada baris
    }

    // Increment urutan terbesar untuk nosp
    urutanTerbesar++;
    var nospValue = urutanTerbesar;

    var row = $('<tr>').appendTo(tableBody);

    $('<td>').text(rowCount + 1).appendTo(row);
    $('<td>').html('<input readonly type="text" name="nosp[]" value="' + nospValue + '" class="nosp form-control form-control-sm mb-3" style="width:100px;">').appendTo(row);
    $('<td>').html('<select id="namabarang_' + rowCount + '" name="namabarang[]" class="namabarang dynamic-select" style="width: 500px; font-size: 14px; height: 34px;" required data-placeholder="Search Items Name ..."></select>').appendTo(row);
    $('<td>').html('<input readonly type="text" name="satuan[]" value="" id="satuan_' + rowCount + '" class="satuanadd form-control form-control-sm mb-3">').appendTo(row);
    $('<td>').html('<input readonly type="text" name="stock[]" value="" id="stock_' + rowCount + '" class="stockadd form-control form-control-sm mb-3">').appendTo(row);
    $('<td>').html('<input type="number" autocomplete="off" required class="qty form-control form-control-sm mb-3" name="qty[]" value="" min="1" max="" style="width:80px;">').appendTo(row);
    $('<td>').html('<select id="divisi_' + rowCount + '" name="divisi[]" style="width:100px;" class="divisi" required data-placeholder="Search Div..."></select>').appendTo(row);
    $('<td>').html('<select class="kodeproduksi form-control select2" style="width: 100%;" id="kodeproduksi_' + rowCount + '" name="kodeproduksi[]" required data-placeholder="Cari kodeproduksi..."></select>').appendTo(row);
    $('<td>').html('<select class="form-control select2" id="spk_' + rowCount + '" name="spk[]" required data-placeholder="Cari SPK..."></select>').appendTo(row);
    $('<td>').html('<textarea id="remarks_' + rowCount + '" class="remarks form-control" name="remarks[]" style="font-size: 14px; width:300px;" required></textarea>').appendTo(row);

    // Inisialisasi Select2
    initializeSelect2('#namabarang_' + rowCount, 'warehouse/get_namabaranglocal.php', 'Cari nama barang...');
    initializeSelect2('#divisi_' + rowCount, 'warehouse/get_divisi.php', 'Search Divisi...');
    initializeSelect2('#kodeproduksi_' + rowCount, 'warehouse/get_kodeproduksi.php', 'Cari kodeproduksi...');
    initializeSelect2('#spk_' + rowCount, 'warehouse/get_spkkk.php', 'Cari SPK...');

    // Toggle input state
    toggleInputState('#spk_' + rowCount, '#kodeproduksi_' + rowCount);
    toggleInputState('#kodeproduksi_' + rowCount, '#spk_' + rowCount);

    // Update satuan dan stock saat namabarang berubah
    updateSatuanAndStockOnChange('#namabarang_' + rowCount);
}


function updateSatuanAndStockOnChange(selector) {
    $(document).on('change', selector, function () {
        var namabarang = $(this).val();
        var row = $(this).closest('tr');
        updateSatuanAndStock(namabarang, row);
    });
}

function updateSatuanAndStock(namabarang, row) {
    $.ajax({
        url: 'warehouse/get_satuandata.php',
        method: 'POST',
        dataType: 'json',
        data: { namabarang: namabarang },
        success: function (response) {
            row.find('.satuanadd').val(response.satuan);
            row.find('.stockadd').val(response.stock);
        },
        error: function (xhr, status, error) {
            console.error('Failed to fetch data:', error);
        }
    });
}

function deleteRow() {
    var table = $("#tableBody")[0];
    if (table.rows.length > 1) {
        table.deleteRow(table.rows.length - 1);
    }
}



    $(document).ready(function() {
    // Initialize Select2 for the initial select element
    $(".namabarang").select2({
        ajax: {
            url: 'warehouse/get_namabaranglocal.php',
            dataType: 'json',
            delay: 250,
            processResults: function(data) {
                console.log('Data from get_namabaranglocal.php:', data); // Debugging line
                return {
                    results: data
                };
            },
            cache: true
        }
    });




    // Function to update satuan and stock when namabarang changes
    function updateSatuanAndStock(selectElement) {
        // Get the selected value
        var namabarang = selectElement.val();

        // Log the value of namabarang to the console
        console.log('Sending AJAX request with namabarang:', namabarang);

        // Send AJAX request to fetch satuan and stock
        $.ajax({
            url: 'warehouse/get_satuandata.php', // Adjust the URL based on your server-side script
            method: 'POST',
            dataType: 'json',
            data: {
                namabarang: namabarang
            },
            success: function(response) {
                console.log('Data fetched:', response); // Debugging line
                // Update the satuan and stock column values for the current row
                var row = selectElement.closest('tr');
                row.find('.satuan').val(response.satuan);
                row.find('.stock').val(response.stock);
            },
            error: function(xhr, status, error) {
                console.log('Failed to fetch data:', error); // Debugging line
            }
        });
    }

    // Event listener for change in namabarang select dropdown
    $(document).on('change', '.namabarang', function() {
        var selectElement = $(this);
        updateSatuanAndStock(selectElement);
    });
});
