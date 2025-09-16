$(document).ready(function () {
    // Inisialisasi DataTables
    $('#myTable, #dataTable, #dataTableHover').DataTable();

    // Inisialisasi Select2
    const selects = ["#class", "#satuan", "#tipe", "#sn"];
    selects.forEach(id => $(id).select2());

    // Fungsi validasi untuk select
    function validateSelect(id, label) {
        $(id).change(function () {
            const value = $(this).val();
            console.log(`Selected ${label}:`, value);
            if (value === null || value === "") {
                alert(`${label} tidak boleh kosong!`);
            }
        });
    }

    validateSelect("#class", "Class");
    validateSelect("#satuan", "Satuan");
    validateSelect("#tipe", "Tipe");
    validateSelect("#sn", "SN");
});

// Fungsi untuk menyimpan data master
function simpanmaster() {
    const namabarang = $("#namabarang").val().trim();
    const itemalias = $("#itemalias").val().trim();
    const classValue = $("#class").val();
    const satuanValue = $("#satuan").val();
    const tipe = $("#tipe").val();
    const minimumstock = $("#minimumstock").val().trim();
    const maxstock = $("#maxstock").val().trim();
    const stock = $("#stock").val().trim();
    const sn = $("#sn").val();

    // Validasi semua field
    if (!namabarang || !itemalias || !classValue || !satuanValue || !tipe ||
        !minimumstock || !maxstock || !stock || !sn) {
        alert("Lengkapi semua data sebelum menyimpan!");
        return;
    }

    // Validasi MaxStock > MinimumStock
    if (parseInt(minimumstock) >= parseInt(maxstock)) {
        alert("Nilai MaxStock harus lebih besar dari MinimumStock!");
        return;
    }

    // Cek apakah item sudah ada
    $.ajax({
        url: 'warehouse/check_item_existence.php',
        type: 'POST',
        data: { namabarang: namabarang },
        success: function(response) {
            if (response === "exists") {
                alert("Item Name sudah ada!");
            } else {
                saveToServer();
            }
        },
        error: function() {
            alert("Terjadi kesalahan saat mengecek item. Silakan coba lagi.");
        }
    });

    // Simpan data ke server
    function saveToServer() {
        $.ajax({
            type: "POST",
            url: "warehouse/simpanmaster.php",
            data: {
                namabarang,
                itemalias,
                classValue,
                satuanValue,
                tipe,
                minimumstock,
                maxstock,
                stock,
                sn,
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
