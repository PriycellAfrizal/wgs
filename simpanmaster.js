$(document).ready(function () {
    // Inisialisasi elemen-elemen select2 (gantilah sesuai kebutuhan)
    $("#class").select2();
    $("#satuan").select2();
    $("#tipe").select2();
    $("#sn").select2();

    // Menangani perubahan pada elemen select
    $("#class").change(function () {
        var selectedClass = $(this).val();
        console.log("Selected Class:", selectedClass);

        // Validasi: Pastikan nilai tidak sama dengan placeholder
        if (selectedClass === null || selectedClass === "") {
            alert("Class tidak boleh kosong!");
            // Lakukan sesuatu jika class kosong (jika diperlukan)
        } else {
            // Lakukan sesuatu dengan nilai class yang dipilih
        }
    });

    // Menangani perubahan pada elemen select
    $("#satuan").change(function () {
        var selectedSatuan = $(this).val();
        console.log("Selected Satuan:", selectedSatuan);

        // Validasi: Pastikan nilai tidak sama dengan placeholder
        if (selectedSatuan === null || selectedSatuan === "") {
            alert("Satuan tidak boleh kosong!");
            // Lakukan sesuatu jika satuan kosong (jika diperlukan)
        } else {
            // Lakukan sesuatu dengan nilai satuan yang dipilih
        }
    });

    // Menangani perubahan pada elemen select
    $("#tipe").change(function () {
        var selectedTipe = $(this).val();
        console.log("Selected Type:", selectedTipe);

        // Validasi: Pastikan nilai tidak sama dengan placeholder
        if (selectedTipe === null || selectedTipe === "") {
            alert("Tipe tidak boleh kosong!");
            // Lakukan sesuatu jika tipe kosong (jika diperlukan)
        } else {
            // Lakukan sesuatu dengan nilai tipe yang dipilih
        }
    });

    // Menangani perubahan pada elemen select
    $("#sn").change(function () {
        var selectedSN = $(this).val();
        console.log("Selected SN:", selectedSN);

        // Validasi: Pastikan nilai tidak sama dengan placeholder
        if (selectedSN === null || selectedSN === "") {
            alert("SN tidak boleh kosong!");
            // Lakukan sesuatu jika SN kosong (jika diperlukan)
        } else {
            // Lakukan sesuatu dengan nilai SN yang dipilih
        }
    });
});

function simpanmaster() {
    // Mendapatkan semua data yang akan disimpan
    var namabarang = $("#namabarang").val();
    var itemalias = $("#itemalias").val();
    var classValue = $("#class").val(); // Get selected value directly
    var satuanValue = $("#satuan").val(); // Get selected value directly
    var tipe = $("#tipe").val(); // Get selected value directly
    var minimumstock = $("#minimumstock").val();
    var maxstock = $("#maxstock").val();
    var stock = $("#stock").val();
    var sn = $("#sn").val(); // Get selected value directly

    // Validasi data kosong atau placeholder sebelum mengirim data
    if (
        namabarang === "" ||
        itemalias === "" ||
        classValue === null || classValue === "" ||
        satuanValue === null || satuanValue === "" ||
        tipe === null || tipe === "" ||
        minimumstock === "" ||
        maxstock === "" ||
        stock === "" ||
        sn === null || sn === ""
    ) {
        alert("Lengkapi semua data sebelum menyimpan!");
        return; // Berhenti jika ada data yang kosong
    }

    // Validasi: Pastikan MaxStock lebih besar dari MinimumStock
    if (parseInt(minimumstock) >= parseInt(maxstock)) {
        alert("Nilai MaxStock harus lebih besar dari MinimumStock!");
        return; // Berhenti jika MaxStock tidak lebih besar dari MinimumStock
    }

    // AJAX request to check if the item name already exists
    $.ajax({
        url: 'warehouse/check_item_existence.php', // Replace with the actual URL to your server-side script
        type: 'POST',
        data: { namabarang: namabarang },
        success: function(response) {
            if (response === "exists") {
                alert("Item Name Is Already");
            } else {
                // Continue with the save operation if the item name doesn't exist
                saveToServer();
            }
        },
        error: function() {
            alert("Error checking item existence. Please try again.");
        }
    });

    // Function to save data to the server
    function saveToServer() {
        // Kirim data ke server menggunakan AJAX
        $.ajax({
            type: "POST",
            url: "warehouse/simpanmaster.php",
            data: {
                namabarang: namabarang,
                itemalias: itemalias,
                classValue: classValue,
                satuanValue: satuanValue,
                tipe: tipe,
                minimumstock: minimumstock,
                maxstock: maxstock,
                stock: stock,
                sn: sn,
            },
            success: function (response) {
                console.log(response);
                $("#exampleModalLong").modal("hide");
                alert("Data berhasil disimpan!");
                location.reload();
            },
            error: function (error) {
                console.error(error);
                alert("Terjadi kesalahan saat menyimpan data. Mohon coba lagi.");
            },
        });
    }
}
