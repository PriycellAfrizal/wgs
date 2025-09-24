$(document).ready(function () {
    // Inisialisasi DataTables
    $('#dataTable').DataTable({
        ordering: false,   // Hilangkan semua fitur sort + panah
        searching: true,   // Pencarian tetap aktif
        paging: true,      // Paging aktif
        info: true,        // Info jumlah baris
        pageLength: 20     // Default tampil 20 baris
    });

    // Modal utama
    const modal = document.getElementById("myModal");
    const closeBtn = document.getElementsByClassName("close")[0];

    // Tombol info
    const infoButtons = document.querySelectorAll('.infoButton');

    // Tutup modal
    function closeModal() {
        modal.style.display = 'none';
    }

    // Klik luar modal → tutup
    document.body.addEventListener("click", function (event) {
        if (modal.style.display === "block" && event.target !== modal && !modal.contains(event.target)) {
            closeModal();
        }
    });

    // Klik tombol close (X)
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // Event click untuk tombol info
    infoButtons.forEach(function (button) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const spk = this.dataset.spk;

            // AJAX untuk ambil data
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        showDetails(data.barang);
                    } else {
                        alert("Gagal mengambil data dari server.");
                    }
                }
            };

            xhr.open('GET', 'get_spkk.php?spk=' + encodeURIComponent(spk), true);
            xhr.send();
        });
    });

    // Fungsi tampilkan detail SPK
    function showDetails(barang) {
        const tbody = document.getElementById("barangTableBody");
        tbody.innerHTML = ""; // Reset tabel

        let nomor = 1;
        barang.forEach(function (item) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${nomor++}</td>
                <td>${item.namabarang}</td>
                <td>${item.qty}</td>
                <td>${item.satuan}</td>
            `;
            tbody.appendChild(row);
        });

        // Notes (gunakan * di depan setiap baris)
        const notes = barang[0].notespk || "";
        const lines = notes.split('\n');
        const formattedNotes = lines.map(line => `* ${line.trim()}`).join('<br>');
        document.getElementById("notesDisplay").innerHTML = formattedNotes;

        // Isi detail lain
        document.getElementById("spkDisplay").textContent = barang[0].spk;
        document.getElementById("tglspkDisplay").textContent = barang[0].tglspk;
        document.getElementById("alamatDisplay").textContent = barang[0].alamat;
        document.getElementById("ocDisplay").textContent = barang[0].oc;
        document.getElementById("tglocDisplay").textContent = barang[0].tglpo;
        document.getElementById("poDisplay").textContent = barang[0].pocust;
        document.getElementById("namacustomerDisplay").textContent = barang[0].namacustomer;

        // Tampilkan modal
        modal.style.display = "block";
    }
});

// Fungsi update status SPK
function updateStatusSPK(spk) {
    Swal.fire({
        title: `<span style="font-weight: normal; color: black;">Apakah yakin ingin menyetujui SPK <strong>${spk}</strong>?</span>`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya',
        cancelButtonText: 'Tidak'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire({
                title: 'Sedang mengirim email SPK kepada Warehouse...',
                text: 'Harap tunggu sebentar.',
                icon: 'info',
                showConfirmButton: false,
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            $.ajax({
                url: 'update_statusspk.php',
                type: 'POST',
                data: { spk: spk },
                success: function (response) {
                    Swal.close();
                    const trimmedResponse = response.trim().toLowerCase();

                    if (trimmedResponse === 'email sent') {
                        Swal.fire({
                            icon: 'success',
                            title: `SPK ${spk} berhasil dikirim kepada Warehouse`,
                            text: 'Email berhasil dikirim.',
                            showConfirmButton: false,
                            timer: 2000
                        }).then(() => {
                            window.location.reload(); // reload halaman setelah sukses
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Gagal Mengirim Email',
                            html: `Pesan Kesalahan:<br><pre style="text-align:left;">${response}</pre>`,
                            confirmButtonText: 'OK'
                        });
                    }
                },
                error: function (xhr, status, error) {
                    Swal.close();
                    Swal.fire({
                        icon: 'error',
                        title: 'Kesalahan Koneksi',
                        text: 'Gagal mengirim permintaan ke server. Periksa koneksi internet Anda.',
                        footer: `<pre style="text-align:left;">${error}</pre>`
                    });
                    console.error("AJAX Error:", xhr.responseText);
                }
            });
        }
    });
}

