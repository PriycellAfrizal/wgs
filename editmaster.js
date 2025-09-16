$(document).ready(function () {
    $('#satuanEdit').select2({
        ajax: {
            url: 'warehouse/get_satuann.php',
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
    // Inisialisasi Select2 untuk #satuan
    $('#class').select2({
      allowClear: true // Aktifkan ini jika ingin memungkinkan penghapusan nilai
    });

    // Tambahkan teks atau placeholder manual untuk satuan
    $('#class').append('<option value="" disabled selected>Class</option>');

    // Ambil data satuan dari database
    $.ajax({
      url: 'warehouse/get_classes.php',
      dataType: 'json',
      success: function(data) {
        // Isi Select2 dengan data satuan
        $.each(data, function(index, value) {
          $('#class').append('<option value="' + value + '">' + value + '</option>');
        });
      }
    });


  // Inisialisasi Select2 untuk #satuan
    $('#satuan').select2({
      allowClear: true // Aktifkan ini jika ingin memungkinkan penghapusan nilai
    });

    // Tambahkan teks atau placeholder manual untuk satuan
    $('#satuan').append('<option value="" disabled selected>Unit</option>');

    // Ambil data satuan dari database
    $.ajax({
      url: 'warehouse/get_mastersatuan.php',
      dataType: 'json',
      success: function(data) {
        // Isi Select2 dengan data satuan
        $.each(data, function(index, value) {
          $('#satuan').append('<option value="' + value + '">' + value + '</option>');
        });
      }
    });
  });


$(document).ready(function () {
    // Inisialisasi Select2 untuk dropdown classEdit
    $('#classEdit').select2({
        ajax: {
            url: 'warehouse/get_classs.php',
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

    // Inisialisasi Select2 untuk dropdown snEdit
    $('#snEdit').select2({
        ajax: {
            url: 'warehouse/get_sn.php',
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
                return 'Mencari...';
            }
        },
        placeholder: 'Cari SN...',
        minimumInputLength: 0,
        allowClear: true,
        formatNoMatches: function () {
            return 'Tidak ditemukan hasil';
        }
    });

    // Inisialisasi Select2 untuk dropdown tipeEdit
    $('#tipeEdit').select2({
        ajax: {
            url: 'warehouse/get_tipe.php',
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
                return 'Mencari...';
            }
        },
        placeholder: 'Cari Tipe...',
        minimumInputLength: 0,
        allowClear: true,
        formatNoMatches: function () {
            return 'Tidak ditemukan hasil';
        }
    });

    // Inisialisasi Select2 untuk dropdown satuanEdit
    $('#satuanEdit').select2({
        ajax: {
            url: 'warehouse/get_satuans.php',
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
                return 'Mencari...';
            }
        },
        placeholder: 'Cari Satuan...',
        minimumInputLength: 0,
        allowClear: true,
        formatNoMatches: function () {
            return 'Tidak ditemukan hasil';
        }
    });

    $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 
        $('#dataTableHover').DataTable(); // ID From dataTable with Hover


    });
});




function openEditModal(clickedElement) {
    var kodebarang = clickedElement.getAttribute('data-kodebarang');
    var namabarang = clickedElement.getAttribute('data-namabarang');
    var satuan = clickedElement.getAttribute('data-satuan');
    var itemalias = clickedElement.getAttribute('data-itemalias');
    var minimumstock = clickedElement.getAttribute('data-minimumstock');
    var maxstock = clickedElement.getAttribute('data-maxstock');
    var tipe = clickedElement.getAttribute('data-tipe');
    var classValue = clickedElement.getAttribute('data-class'); // Menangkap nilai class

    // Buat promise untuk mendapatkan nilai sn
    var getSnPromise = new Promise(function (resolve, reject) {
        var snData = clickedElement.getAttribute('data-sn');

        if (snData) {
            var snArray = snData.split(',');
            resolve(snArray);
        } else {
            $.ajax({
                type: "GET",
                url: "warehouse/get_sn.php",
                dataType: 'json',
                success: function (data) {
                    resolve(data);
                },
                error: function (error) {
                    reject(error);
                }
            });
        }
    });

    // Buat promise untuk mendapatkan nilai tipe
    var getTipePromise = new Promise(function (resolve, reject) {
        var tipeData = clickedElement.getAttribute('data-tipe');

        if (tipeData) {
            var tipeArray = tipeData.split(',');
            resolve(tipeArray);
        } else {
            $.ajax({
                type: "GET",
                url: "warehouse/get_tipe.php",
                dataType: 'json',
                success: function (data) {
                    resolve(data);
                },
                error: function (error) {
                    reject(error);
                }
            });
        }
    });

    // Gunakan promise untuk menangkap nilai sn, tipe, dan membuka modal setelahnya
    Promise.all([getSnPromise, getTipePromise]).then(function (values) {
        var snArray = values[0];
        var tipeArray = values[1];

        // Isi input di dalam modal dengan data dari baris yang bersangkutan
        $("#kodebarangEdit").val(kodebarang);
        $("#namabarangEdit").val(namabarang);
        $("#itemaliasEdit").val(itemalias);
        $("#minimumstockEdit").val(minimumstock);
        $("#maxstockEdit").val(maxstock);
    $("#namaEdit").val(data.nama || 'Seseorang'); 

        // Set the value in the Select2 dropdown for satuanEdit
        var satuanEditSelect = $("#satuanEdit");
        satuanEditSelect.empty();
        var optionSatuan = new Option(satuan, satuan, true, true);
        satuanEditSelect.append(optionSatuan).trigger('change');

        // Set the value in the Select2 dropdown for classEdit
        var classEditSelect = $("#classEdit");
        classEditSelect.empty();
        var optionClass = new Option(classValue, classValue, true, true);
        classEditSelect.append(optionClass).trigger('change');

    // Set the value in the Select2 dropdown for snEdit
var snEditSelect = $("#snEdit");
snEditSelect.empty();

$.each(snArray, function (index, value) {
    // Check if the value is an object
    if (typeof value === 'object') {
        // Check if the object has a specific property, for example, 'name'
        if (value.name !== undefined && value.name !== null) {
            var optionSn = new Option(value.name, value.name, true, true);
            snEditSelect.append(optionSn);
        }
    } else {
        // If it's not an object, use the value directly
        var optionSn = new Option(value, value, true, true);
        snEditSelect.append(optionSn);
    }
});

snEditSelect.trigger('change');

        

        // Set the value in the Select2 dropdown for tipeEdit
        var tipeEditSelect = $("#tipeEdit");
        tipeEditSelect.empty();
        $.each(tipeArray, function (index, value) {
            var optionTipe = new Option(value, value, true, true);
            tipeEditSelect.append(optionTipe);
        });
        tipeEditSelect.trigger('change');

        // Buka modal
        $("#exampleModalScrollable").modal("show");
    }).catch(function (error) {
        console.error(error);
    });
}

function saveChanges() {
    var kodebarang = $("#kodebarangEdit").val();
    var namabarang = $("#namabarangEdit").val();
    var satuan = $("#satuanEdit").val();
    var itemalias = $("#itemaliasEdit").val();
    var minimumstock = $("#minimumstockEdit").val();
    var maxstock = $("#maxstockEdit").val();
    var tipe = $("#tipeEdit").val();
    var classValue = $("#classEdit").val();
    var snData = $("#snEdit").val();
    var nama = $("#namaEdit").val();

    

    // Validasi data kosong atau placeholder sebelum mengirim data
    if (
        namabarang === "" ||
        itemalias === "" ||
        classValue === null || classValue === "" ||
        satuan === null || satuan === "" ||
        tipe === null || tipe === "" ||
        snData === null || snData === "" ||
        minimumstock === "" ||
        maxstock === ""
    ) {
        alert("Lengkapi semua data sebelum menyimpan perubahan!");
        return;
    }

    // Check if maxstock is greater than or equal to minimumstock
    if (parseInt(maxstock) < parseInt(minimumstock)) {
        alert("Nilai MaxStock harus lebih besar atau sama dengan MinimumStock!");
        return;
    }

  var data = {
    kodebarang: kodebarang,
    namabarang: namabarang,
    satuan: satuan,
    itemalias: itemalias,
    minimumstock: minimumstock,
    maxstock: maxstock,
    tipe: tipe,
    classValue: classValue,  // Include classValue in the data object
    sn: snData,
      nama : nama
};


    $.ajax({
        type: "POST",
        url: "warehouse/updatedatamaster.php",
        data: data,
        success: function (response) {
            console.log(response);
            $("#exampleModalScrollable").modal("hide");
            alert("Perubahan berhasil disimpan!");
            location.reload();
        },
        error: function (error) {
            console.error(error);
            alert("Terjadi kesalahan saat menyimpan perubahan. Mohon coba lagi.");
        }
    });
}
