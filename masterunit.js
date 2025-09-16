function simpanmasterunits() {
    var elSatuan = document.getElementById("satuan");
    if (!elSatuan) { alert("Input satuan tidak ditemukan!"); return; }

    var satuanValue = elSatuan.value.trim();
    if (satuanValue === "") { alert("Satuan tidak boleh kosong"); return; }

    var data = { satuan: satuanValue };
    fetch('warehouse/simpanmasterunit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(result => {
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
