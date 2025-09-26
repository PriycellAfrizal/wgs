        
    $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 
        $('#dataTableHover').DataTable(); // ID From dataTable with Hover


    });

function editpo(button) {
    var nopo = $(button).data('nopo');

    $.ajax({
        url: 'warehouse/get_nopo_details.php', // URL ke server-side script untuk mengambil data
        type: 'GET',
        data: { nopo: nopo },
        dataType: 'html', // Menentukan tipe data yang diharapkan dari server
        success: function(response) {
            if (response) {
                $('#modalBody').html(response); // Isi modal dengan data yang diterima
                $('#infoModal').modal('show'); // Tampilkan modal
            } else {
                console.warn('Peringatan: Data kosong diterima.');
            }
        },
        error: function(xhr, status, error) {
            console.error('AJAX Error:', status, error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal Mengambil Data',
                text: 'Terjadi kesalahan saat mengambil data PO.',
            });
        }
    });
}


function savesuratjalan() {


    const noposurat = document.getElementById('noposurat').value;

    const nopo = document.getElementById('nopo').value;

    const subtotal = document.getElementById('subtotal').value;

    const ppnAmount = document.getElementById('ppnAmount').value;

    const totalall = document.getElementById('totalall').value;



    const nosuratjalan = document.getElementById('nosuratjalan').value;
    const tglsj = document.getElementById('tglsj').value;
    const qtyInputs = document.getElementsByClassName('qty-input');
    const nospInputs = document.getElementsByClassName('nosp-input');
    const qtys = [];
    const nosps = [];

    for (let i = 0; i < qtyInputs.length; i++) {
        qtys.push(qtyInputs[i].value);
        nosps.push(nospInputs[i].value);
    }

    const data = new URLSearchParams();

    data.append('noposurat', noposurat);

    data.append('nopo', nopo);

    data.append('subtotal', subtotal);


    data.append('ppnAmount', ppnAmount);

    data.append('totalall', totalall);
    
    data.append('nosuratjalan', nosuratjalan);
    data.append('tglsj', tglsj);
    qtys.forEach((qty, index) => {
        data.append('qty[]', qty);
    });
    nosps.forEach((nosp, index) => {
        data.append('nosp[]', nosp);
    });

    fetch('warehouse/editpo.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    })
    .then(response => response.text())
    .then(result => {
        // Menggunakan SweetAlert untuk menampilkan pesan sukses
        Swal.fire({
            icon: 'success',
            title: 'Surat Jalan Berhasil Di Buat',
            showConfirmButton: false,
            timer: 2000 // Menunggu 2 detik sebelum melakukan refresh
        });
        
        // Me-refresh halaman setelah 2 detik
        setTimeout(() => {
            location.reload();
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


  var modal = document.getElementById('myModal');
    var btn = document.getElementById('openModalBtn');

    // Ketika pengguna mengklik tombol untuk menutup modal
    function closeModal() {
        modal.style.display = 'none';
        // Hapus event listener setelah modal ditutup
        document.removeEventListener('click', outsideClickHandler);
    }

    // Fungsi untuk menangani klik di luar modal
    function outsideClickHandler(event) {
        if (!modal.contains(event.target)) {
            closeModal();
        }
    }



    function openModal(button) {
        var nopo = button.getAttribute('data-nopo'); // Ambil nilai atribut data-nopo dari tombol yang ditekan
        modal.style.display = 'block'; // Tampilkan modal

        // Menggunakan AJAX untuk mengambil data terkait nopo
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                // Parsing data JSON yang dikirim dari server
                var data = JSON.parse(this.responseText);

                console.log(data); // Debugging: Tampilkan data yang diterima di console

                // Memasukkan nilai nopo ke dalam modal
                document.getElementById('pocoDisplay').innerText = data.poco;
                document.getElementById('cpDisplay').innerText = data.cp;
                document.getElementById('telpDisplay').innerText = data.telp;
                document.getElementById('nopoDisplay').innerText = data.nopo;
                document.getElementById('namasuplierDisplay').innerText = data.namasuplier;
                document.getElementById('tglpoDisplay').innerText = data.tglpo;

                // Mengisi informasi barang
                var tableBody = document.getElementById('barangTableBody');
                tableBody.innerHTML = '';
                data.barang.forEach(function(item, index) {
                    var row = tableBody.insertRow();
                    var cell1 = row.insertCell(0);
                    var cell2 = row.insertCell(1);
                    var cell3 = row.insertCell(2);
                    var cell4 = row.insertCell(3);
                    var cell5 = row.insertCell(4);
                    var cell6 = row.insertCell(5);

                    cell1.innerText = index + 1; // Nomor urut
                    cell2.innerText = item.namabarang; // Nama Barang
                    cell3.innerText = item.qty; // Qty
                    cell4.innerText = item.satuan; // Satuan
                    cell5.innerText = item.nosp; // No. SP

                    // Mengambil data qty dari splocal
                    var xhttpQty = new XMLHttpRequest();
                    xhttpQty.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                            var qtyData = JSON.parse(this.responseText);
                            cell6.innerText = qtyData.qty; // Mengisi nilai qty
                        }
                    };
                    xhttpQty.open("GET", "purchaselocal/get_qtysplocal.php?nosp=" + item.nosp + "&namabarang=" + encodeURIComponent(item.namabarang), true);
                    xhttpQty.send();
                });

                // Memasukkan data posuratjalan ke dalam tabel
                var sjTableBody = document.getElementById('suratjalanTableBody');
                sjTableBody.innerHTML = '';
                if (data.posuratjalan) {
                data.posuratjalan.forEach(function(sjItem, index) {
    var sjRow = sjTableBody.insertRow();
    var cell1 = sjRow.insertCell(0);
    var cell2 = sjRow.insertCell(1);
    var cell3 = sjRow.insertCell(2);
    var cell4 = sjRow.insertCell(3);
    var cell5 = sjRow.insertCell(4);
    var cell6 = sjRow.insertCell(5);

    cell1.innerText = index + 1;
    cell2.innerText = sjItem.nosuratjalan;
    cell3.innerText = sjItem.tglsj;
    cell4.innerText = sjItem.namabarang;

    // Pastikan qty sebagai double
    var qtyDouble = parseFloat(sjItem.qty);
    cell5.innerText = qtyDouble; // atau qtyDouble.toFixed(2) jika mau 2 desimal
    cell6.innerText = sjItem.nosp;
});
                }

                // Update labelDisplay berdasarkan nilai poco
                var labelDisplay = document.getElementById("labelDisplay");
                if (data.poco === "PO") {
                    labelDisplay.textContent = "NO. PO :";
                } else {
                    labelDisplay.textContent = "NO. CO :";
                }
            }
        };

        // Ganti URL berikut dengan URL yang sesuai untuk mengambil data PO berdasarkan nopo
        xhttp.open("GET", "warehouse/get_Historypo.php?nopo=" + nopo, true);
        xhttp.send();
    }
