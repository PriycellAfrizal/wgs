    $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 
        $('#dataTableHover').DataTable(); // ID From dataTable with Hover

    });
                 function showHistory(kodebarang) {
                    // Mengirim permintaan Ajax ke server untuk mendapatkan tgl_in dan tgl_out
                    $.ajax({
                      type: "POST",
                      url: "warehouse/get_History.php", // Ganti dengan nama file PHP yang akan menghandle permintaan ini
                      data: {
                        kodebarang: kodebarang
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


                            function checksn() {
                              var snSelect = document.getElementById("sn");
                              var serialNumberInput = document.getElementById("serialnumber");
                              var stockInInput = document.getElementById("stock_in");

                              // Periksa nilai dari SN
                              console.log("Nilai SN:", snSelect.value.trim().toUpperCase());

                              if (snSelect.value.trim().toUpperCase() === "YES") {
                                // Jika SN adalah "YES," nonaktifkan readonly pada input nomor seri
                                serialNumberInput.readOnly = false;
                                // Bersihkan nilai jika ada
                                serialNumberInput.value = "";

                                // Set nilai stock_in menjadi 1 dan nonaktifkan inputnya
                                stockInInput.value = 1;
                                stockInInput.disabled = true;
                              } else {
                                // Jika SN bukan "YES," aktifkan readonly pada input nomor seri dan atur nilai default menjadi null
                                serialNumberInput.readOnly = true;
                                serialNumberInput.value = "";

                                // Aktifkan kembali input stock_in dan atur nilai default menjadi null
                                stockInInput.disabled = false;
                                stockInInput.value = null;
                              }
                            }
                          
            function fetchKodeBarang() {
              // Get the selected nama barang
              var selectedNamabarang = $("#namabarang").val();

              // Make an AJAX request to get the corresponding kodebarang
              $.ajax({
                type: "GET",
                url: "warehouse/get_kodebarang.php", // Replace with the actual server-side script to handle the data
                data: {
                  namabarang: selectedNamabarang
                },
                dataType: 'json',
                success: function(response) {
                  // Update the hidden input field with the fetched kodebarang
                  $("#kodebarang").val(response.kodebarang);

                  // Update the value of sn
                  $("#sn").val(response.sn);


                  // Check the value of sn and update the serialnumber input accordingly
                  checksn();
                },
                error: function(error) {
                  // Handle errors, if any
                  console.error(error);
                }
              });
            }

         function saveChangesmasuk() {
  var tgl_in = $("#tgl_in").val();
  var namabarang = $(".namabarang").val();
  var satuan = $("#satuan").val();
  var stock_in = $(".qty").val();
  var serialnumber = $("#serialnumber").val();
  var remarks = $("#remarks").val();
  var kodebarang = $("#kodebarang").val();
  var sn = $("#sn").val();

  if (!stock_in) {
    alert("Lengkapi Qty");
    return;
  }

  if (!tgl_in || !namabarang || !satuan || !stock_in || !kodebarang || !sn) {
    alert("Lengkapi semua data sebelum menyimpan");
    return;
  }

  if (sn.trim().toLowerCase() !== "no" && !serialnumber) {
    alert("Lengkapi Serial Number");
    return;
  }

  var data = {
    tgl_in: tgl_in,
    namabarang: namabarang,
    satuan: satuan,
    stock_in: stock_in,
    serialnumber: serialnumber,
    remarks: remarks,
    kodebarang: kodebarang,
    sn: sn
  };

  // --- CEK DULU apakah serialnumber sudah ada di barangin ---
  $.ajax({
    type: "POST",
    url: "warehouse/check_serial.php", // bikin file ini
    data: { namabarang: namabarang, serialnumber: serialnumber },
    success: function(resp) {
      if (resp === "EXIST") {
        alert("Serial Number sudah ada untuk barang ini, penyimpanan dibatalkan!");
        return;
      } else {
        // Lanjutkan penyimpanan
        $.ajax({
          type: "POST",
          url: "warehouse/save_changes.php",
          data: data,
          success: function(response) {
            console.log(response);
            $("#exampleModalScrollable").modal("hide");
            alert("Data berhasil disimpan!");
            location.reload();
          },
          error: function(error) {
            console.error(error);
          }
        });
      }
    },
    error: function(err) {
      console.error(err);
    }
  });
}


            $(document).ready(function() {
              // Inisialisasi Select2
              $('.namabarang').select2({
                ajax: {
                  url: 'warehouse/get_namabarang.php',
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



              $('.namabarang').on('change', function() {
                // Mendapatkan elemen terpilih
                var selectedElement = $('.namabarang').find(':selected');

                // Memperbarui warna teks menjadi hitam
                selectedElement.css('color', 'black');

                // Mendapatkan nilai yang dipilih
                var namabarang = $(this).val();


                $.ajax({
                  url: 'warehouse/get_satuan.php', // Adjust the URL based on your server-side script
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
          
