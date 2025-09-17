function simpanmasterdivisi() {
    var divisiValue = $("#divisi").val();

    if (!divisiValue.trim()) {
        alert("Please enter a valid divisi.");
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
            alert(response.message);
            location.reload();
            $('#yourModalId').modal('hide');
        } else {
            alert("Gagal: " + response.message);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Terjadi kesalahan saat menyimpan divisi");
    });
}
