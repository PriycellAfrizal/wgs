function simpanmasterunits() {
    // Mendapatkan nilai dari input dengan id "satuan"
    var satuanValue = document.getElementById("satuan").value;

    // Validasi apakah nilai satuan tidak kosong
    if (satuanValue.trim() === "") {
        alert("Satuan tidak boleh kosong");
        return;
    }

    // Membuat objek data yang akan dikirimkan ke server
    var data = {
        satuan: satuanValue
    };

    // Mengirim permintaan AJAX ke server
    fetch('warehouse/simpanmasterunit.php', {
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

        // Menutup modal setelah berhasil menyimpan atau melakukan operasi lainnya
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

