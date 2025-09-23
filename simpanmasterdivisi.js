function simpanmasterdivisi() {
    let divisiValue = $("#divisi").val().trim();

    // Validasi input kosong
    if (!divisiValue) {
        Swal.fire({
            icon: "warning",
            title: "Peringatan",
            text: "Divisi tidak boleh kosong!"
        });
        return;
    }

    fetch("warehouse/simpanmasterdivisi.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ divisi: divisiValue })
    })
    .then(res => res.json())
    .then(response => {
        if (response.status === "success") {
            Swal.fire({
                icon: "success",
                title: "Berhasil",
                text: response.message,
                timer: 2000,
                showConfirmButton: false
            }).then(() => {
                $('#yourModalId').modal('hide');
                location.reload();
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Gagal",
                text: response.message
            });
        }
    })
    .catch(err => {
        console.error(err);
        Swal.fire({
            icon: "error",
            title: "Kesalahan",
            text: "Terjadi kesalahan saat menyimpan divisi!"
        });
    });
}
