function simpanmasterchasis() {
    // Mendapatkan nilai dari input dengan id "type" dan "skrb"
    var typeValue = document.getElementById("type").value;
    var skrbValue = document.getElementById("skrb").value;

    // Validasi apakah nilai type dan skrb tidak kosong
    if (typeValue.trim() === "" || skrbValue.trim() === "") {
        alert("Type Chassis dan SKRB Chassis tidak boleh kosong");
        return;
    }

    // Membuat objek data yang akan dikirimkan ke server
    var data = {
        type: typeValue,
        skrb: skrbValue
    };

    // Mengirim permintaan AJAX ke server
    fetch('produksi/simpanmasterchasis.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        // Handle respons dari server
        console.log(result);

        // Menutup modal setelah berhasil menyimpan
        $('#exampleModalLong').modal('hide');

        // Menampilkan alert berdasarkan respons dari server
        if (result.status === "success") {
            alert("Data berhasil disimpan!");
            // Me-reload halaman setelah menampilkan alert
            location.reload();
        } else {
            alert("Terjadi kesalahan: " + result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menyimpan data ke database');
    });
}
