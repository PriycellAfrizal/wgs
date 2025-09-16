function simpanmasterunits() {
    var satuan = $("#satuan").val().trim();

    // Validasi input kosong
    if (!satuan) {
        alert("Unit (Satuan) tidak boleh kosong!");
        $("#satuan").focus();
        return;
    }

    // Cek apakah unit sudah ada
    $.ajax({
        url: 'warehouse/check_unit_existence.php',
        type: 'POST',
        data: { satuan: satuan },
        success: function(response) {
            if (response === "exists") {
                alert("Unit sudah ada!");
                $("#satuan").focus();
            } else {
                // Simpan unit baru
                $.ajax({
                    type: "POST",
                    url: "warehouse/simpanmasterunit.php",
                    data: { satuan: satuan },
                    success: function (res) {
                        console.log(res);
                        $("#exampleModalLong").modal("hide");
                        alert("Unit berhasil disimpan!");
                        location.reload(); // bisa diganti dengan update DataTable jika ingin tanpa reload
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
