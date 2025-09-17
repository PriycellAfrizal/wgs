$(document).ready(function () {
    // Inisialisasi DataTable
    var table = $('#myTable').DataTable(); // ganti dengan ID tabelmu

    // Tombol simpan unit
    $('#simpanUnitBtn').on('click', function() {
        simpanmasterunits();
    });

    function simpanmasterunits() {
        var satuanInput = document.getElementById("satuan");
        if (!satuanInput) {
            alert("Input satuan tidak ditemukan!");
            return;
        }

        var satuan = satuanInput.value.trim();

        if (!satuan) {
            alert("Unit (Satuan) tidak boleh kosong!");
            satuanInput.focus();
            return;
        }

        // Kirim data ke PHP
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

                    // Tambahkan data baru ke DataTable tanpa reload
                    table.row.add([satuan]).draw(false);

                    // Kosongkan input
                    satuanInput.value = '';
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
});
