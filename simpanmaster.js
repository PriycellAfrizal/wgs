$(document).ready(function () {
    // Inisialisasi Select2 jika dibutuhkan (di sini hanya input text, jadi opsional)
    // $("#satuan").select2(); // hapus atau aktifkan jika memang select
    
    // Event tombol simpan
    $("#btnSimpanMaster").click(function () {
        simpanmasterunits();
    });
});

function simpanmasterunits() {
    var satuan = $("#satuan").val().trim();

    // Validasi input kosong
    if (!satuan) {
        alert("Unit (Satuan) tidak boleh kosong!");
        $("#satuan").focus();
        return;
    }

    // Cek apakah unit sudah ada di database
    $.ajax({
        url: 'warehouse/check_unit_existence.php', // sesuaikan dengan file PHP Anda
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
                    url: "warehouse/simpanmasterunit.php", // sesuaikan dengan file PHP untuk simpan
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
