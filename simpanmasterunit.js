function simpanmasterunits() {
    var satuan = $("#satuan").val().trim();

    // Validasi input kosong
    if (!satuan) {
        alert("Unit (Satuan) tidak boleh kosong!");
        $("#satuan").focus();
        return;
    }

    // Kirim data langsung ke PHP tanpa pengecekan
    $.ajax({
        type: "POST",
        url: "warehouse/simpanmasterunit.php",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ satuan: satuan }),
        dataType: "json",
        success: function(response) {
            if (response.status === "success") {
                $("#exampleModalLong").modal("hide");
                alert(response.message);
                location.reload(); // bisa diganti dengan reload DataTable jika mau
            } else {
                alert("Terjadi kesalahan: " + response.message);
            }
        },
        error: function(err) {
            console.error(err);
            alert("Terjadi kesalahan saat menyimpan unit.");
        }
    });
}
