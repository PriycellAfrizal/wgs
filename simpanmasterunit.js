$(document).ready(function () {
    // Inisialisasi DataTables dengan columnDefs sederhana
    $('#myTable, #dataTable, #dataTableHover').DataTable({
        "columnDefs": [
            { "targets": 0, "orderable": false },
            { "targets": -1, "orderable": false }
        ]
    });

    // Event tombol simpan unit
    $("#btnSimpanMaster").click(function () {
        simpanmasterunits();
    });
});

function simpanmasterunits() {
    var satuan = $("#satuan").val().trim();

    if (!satuan) {
        alert("Unit (Satuan) tidak boleh kosong!");
        $("#satuan").focus();
        return;
    }

    $.ajax({
        url: 'warehouse/check_unit_existence.php',
        type: 'POST',
        data: { satuan: satuan },
        success: function(response) {
            if (response === "exists") {
                alert("Unit sudah ada!");
                $("#satuan").focus();
            } else {
                $.ajax({
                    type: "POST",
                    url: "warehouse/simpanmasterunit.php",
                    data: { satuan: satuan },
                    success: function (res) {
                        console.log(res);
                        $("#exampleModalLong").modal("hide");
                        alert("Unit berhasil disimpan!");
                        location.reload();
                    },
                    error: function (err) {
                        console.error(err);
                        alert("Terjadi kesalahan saat menyimpan unit.");
                    }
                });
            }
        },
        error: function() {
            alert("Terjadi kesalahan saat mengecek unit.");
        }
    });
}
