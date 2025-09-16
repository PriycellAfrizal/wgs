function simpanmasterunits() {
    var satuanValue = (document.getElementById("satuan").value || "").trim();

    if (satuanValue === "") {
        alert("Satuan tidak boleh kosong");
        return;
    }

    var data = { satuan: satuanValue };
    console.log("Payload dikirim:", data);

    fetch('warehouse/simpanmasterunit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        console.log("Response server:", result);
        if (result.status === "success") {
            $('#exampleModalLong').modal('hide');
            alert(result.message);
            location.reload();
        } else {
            alert("Terjadi kesalahan: " + result.message);
        }
    })
    .catch(err => {
        console.error('Fetch error:', err);
        alert('Terjadi kesalahan saat menyimpan data ke database');
    });
}
