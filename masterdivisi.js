function simpanmasterdivisi() {
    var divisiValue = $("#divisi").val().trim();

    if (!divisiValue) {
        Swal.fire("Peringatan", "Divisi tidak boleh kosong!", "warning");
        return;
    }

    // Gunakan FormData agar PHP $_POST terbaca
    let formData = new FormData();
    formData.append("divisi", divisiValue);

    fetch("warehouse/simpanmasterdivisi.php", {
        method: "POST",
        body: formData
    })
    .then(res => {
        if (!res.ok) throw new Error("Network response not ok");
        return res.json();
    })
    .then(response => {
        if (response.success) {
            // Tampilkan notifikasi 3 detik, tanpa tombol OK
            Swal.fire({
                title: "Sukses",
                text: response.message,
                icon: "success",
                timer: 3000,
                showConfirmButton: false,
                didClose: () => {
                    $("#exampleModalLong").modal("hide");
                    location.reload();
                }
            });
        } else {
            Swal.fire("Gagal", response.message, "error");
        }
    })
    .catch(err => {
        console.error(err);
        Swal.fire("Error", "Terjadi kesalahan saat menyimpan divisi", "error");
    });
}
