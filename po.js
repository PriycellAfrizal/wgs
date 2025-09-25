
   $(document).ready(function () {

        $('#myTable').DataTable(); // ID From dataTable 
        $('#dataTable').DataTable(); // ID From dataTable 
        $('#dataTableHover').DataTable(); // ID From dataTable with Hover
        





    });

document.addEventListener('DOMContentLoaded', function() {
    // Set initial value of PPN amount input field to empty string
    document.getElementById('ppnAmount').value = '';

    // Add event listener for input changes in PPN amount field
    document.getElementById('ppnAmount').addEventListener('input', function(event) {
        // Check and calculate PPN if '=' is present
        checkAndCalculatePPN();
    });
});





 // Get the search input field
  var searchInput = document.getElementById('searchInput');

  // Get the tbody element
  var tbody = document.getElementById('table-sp');

  // Add event listener to search input field
  searchInput.addEventListener('keyup', searchTable);

  // Fungsi untuk mencari data
  function searchTable() {
    var searchTerm = searchInput.value.toLowerCase();
    var rows = tbody.getElementsByTagName('tr');

    for (var i = 0; i < rows.length; i++) {
      var row = rows[i];
      var cells = row.getElementsByTagName('td');
      var text = '';

      for (var j = 0; j < cells.length; j++) {
        text += cells[j].textContent.toLowerCase();
      }

      if (text.indexOf(searchTerm) > -1) {
        row.style.display = '';
      } else {
        row.style.display = 'none';
      }
    }
  }
// Ambil semua baris dalam tabel SP
var rows = document.querySelectorAll('#table-sp tr');
var selectedIndex = 0;

// Tambahkan event listener untuk setiap baris
rows.forEach(function(row) {
  // Tambahkan event listener untuk checkbox di setiap baris
  var checkbox = row.querySelector('.row-select');
  checkbox.addEventListener('change', function() {
    if (checkbox.checked) {
      row.classList.add('selected');
      row.dataset.selectedIndex = selectedIndex++;
    } else {
      row.classList.remove('selected');
      delete row.dataset.selectedIndex;
    }
  });

  // Tambahkan event listener untuk klik pada baris (selain checkbox)
  row.addEventListener('click', function(event) {
    // Periksa apakah yang diklik adalah checkbox atau bukan
    if (event.target.type !== 'checkbox') {
      checkbox.checked = !checkbox.checked;
      if (checkbox.checked) {
        row.classList.add('selected');
        row.dataset.selectedIndex = selectedIndex++;
      } else {
        row.classList.remove('selected');
        delete row.dataset.selectedIndex;
      }
    }
  });

  // Ubah kursor mouse saat mengarahkan pada baris
  row.addEventListener('mousemove', function() {
    row.style.cursor = 'pointer';
  });
});

// Event listener untuk tombol "Select All"
var selectAllCheckbox = document.getElementById('select-all');
selectAllCheckbox.addEventListener('change', function() {
  rows.forEach(function(row) {
    var checkbox = row.querySelector('.row-select');
    checkbox.checked = selectAllCheckbox.checked;

    if (selectAllCheckbox.checked) {
      row.classList.add('selected');
      row.dataset.selectedIndex = selectedIndex++;
    } else {
      row.classList.remove('selected');
      delete row.dataset.selectedIndex;
    }
  });
});








function buatpo() {
    var selectedRows = Array.from(document.querySelectorAll('.selected')); // Ambil semua baris yang dipilih
    var poTableBody = document.getElementById('poTableBody');
    poTableBody.innerHTML = '';

    if (selectedRows.length === 0) {
        alert("Pilih terlebih dahulu SP yang akan diproses");
        return;
    }

    // Urutkan selectedRows berdasarkan urutan pemilihan
    selectedRows.sort(function(a, b) {
        return a.dataset.selectedIndex - b.dataset.selectedIndex;
    });

    selectedRows.forEach(function(rowSelect, index) {
        var row = rowSelect;
        var nosp = row.children[2].textContent.trim();
        var namabarang = row.children[3].textContent.trim();
        var qty = row.children[4].textContent.trim();
        var satuan = row.children[5].textContent.trim();
        var divisi = row.children[6].textContent.trim();
        var kodeproduksi = row.children[7].textContent.trim();
        var spk = row.children[8].textContent.trim();

        console.log(`Sebelum: namabarang=${namabarang}, qty=${qty}, satuan=${satuan}`);

        // Tambahkan logika untuk mengubah qty dan satuan
const namabarangList = ["THINNER A", "OLI TURALIK 52","OLI RORED"];
if (namabarangList.includes(namabarang.toUpperCase()) && qty == 200 && satuan === "Liter") {
    qty = 1; // ubah qty menjadi 1
    satuan = "Drum"; // ubah satuan menjadi Drum
}





        console.log(`Sesudah: qty=${qty}, satuan=${satuan}`);

        var price = `<input type="text" class="price" autocomplete="off" id="price${index}" required name="price" oninput="formatOnInput(this, ${index})">`;
        var discount = `<input type="text" id="discount${index}" style="text-align: center; width: 60px;" name="discount" placeholder="" oninput="updateTotalPrice(this, ${index}); validateNumberInput(this);">`;
        var discountAmount = `<input type="text" name="discountAmount" disabled id="discountAmount${index}">`;
        var totalprice = `<input type="text" name="totalprice" disabled id="totalprice${index}">`;

        // Tambahkan baris baru ke dalam tabel PO dengan qty dan satuan yang sudah diperbarui
        var newRow = `<tr>
                        <td>${index + 1}</td>
                        <td>${nosp}</td>
                        <td>${namabarang}</td>
                        <td style="text-align: center;">
                            <input type="text" name="qty" id="qty${index}" value="${qty}" style="width: 50px; text-align: center;" oninput="updateTotalPrice(this, ${index})" data-buatpoqty="${parseFloat(qty)}">
                        </td>
                        <td>${satuan}</td>
                        <td style="display: none;">${divisi}</td>
                        <td style="text-align: center;">${price}</td>
                        <td style="text-align: center; width: 50px;">${discount}</td>
                        <td style="display: none;">${discountAmount}</td>
                        <td class="total-price-cell">${totalprice}</td>
                        <td style="display:none;">${kodeproduksi}</td>
                        <td style="display:none;">${spk}</td>
                      </tr>`;

        poTableBody.innerHTML += newRow;
    });

    $('#exampleModalScrollable').modal('hide');
    $('#poModal').modal('show');
}

function parseRupiah(rupiah) {
    // Mengizinkan simbol minus dan menghapus karakter lain kecuali angka dan koma
    return parseFloat(rupiah.replace(/[^0-9,-]/g, '').replace(',', '.'));
}


function formatRupiah(value) {
    let numberString = value.toString().replace(/[^0-9.]/g, '');
    let split = numberString.split('.');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);
    if (ribuan) {
        let separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }
    if (split[1] !== undefined) {
        rupiah += ',' + (split[1].length === 1 ? split[1] + '0' : split[1].substr(0, 2));
    }
    return 'Rp. ' + rupiah;
}



function updateTotalPrice(element, index) {
    // Ambil dan parsing qty: hanya izinkan titik sebagai desimal
    let qtyInput = document.getElementById('qty' + index).value;

    // Hanya validkan angka dan titik, hapus karakter lain
    qtyInput = qtyInput.replace(/[^0-9.]/g, '');
    let qty = parseFloat(qtyInput) || 0;

    // Update input qty agar selalu valid
    document.getElementById('qty' + index).value = qtyInput;

    // Ambil harga (Rp) dan parsing jadi number
    let price = parseRupiah(document.getElementById('price' + index).value) || 0;

    // Ambil diskon, hanya angka dan titik sebagai desimal
    let discountInput = document.getElementById('discount' + index).value;
    let sanitizedDiscountInput = discountInput.replace(/[^0-9.]/g, '');
    let discount = parseFloat(sanitizedDiscountInput) || 0;

    // Update input diskon dengan versi valid
    document.getElementById('discount' + index).value = sanitizedDiscountInput;

    // Hitung diskon
    let discountAmount = (price * qty) * (discount / 100);

    // Hitung total harga setelah diskon
    let totalPrice = (price * qty) - discountAmount;

    // Update elemen input dengan format Rupiah
    document.getElementById('discountAmount' + index).value = formatRupiah(discountAmount.toFixed(2));
    document.getElementById('totalprice' + index).value = formatRupiah(totalPrice.toFixed(2));

    // Update subtotal tabel
    updateSubtotal();
}


function updateSubtotal() {
    let totalElements = document.querySelectorAll('[id^="totalprice"]');
    let subtotal = 0;

    totalElements.forEach(element => {
        let totalValue = parseRupiah(element.value) || 0;
        subtotal += totalValue;
    });

    document.getElementById('subtotal').value = formatRupiah(subtotal.toFixed(2).toString());
    updateAmounts();
}

function formatOnInput(element, index) {
    let value = element.value.replace(/[^0-9,]/g, '').toString();
    if (value !== "") {
        element.value = 'Rp. ' + value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    updateTotalPrice(element, index);
}

function calculatePPNAmount() {
    let ppnPercentage = parseFloat(document.getElementById('ppn').value) || 0;
    let subtotal = parseRupiah(document.getElementById('subtotal').value) || 0;
    let ppnAmount = (ppnPercentage / 100) * subtotal;
    
    document.getElementById('ppnAmount').value = formatRupiah(ppnAmount.toFixed(2).toString());

    updateTotalAll();
}

function preventComma(input) {


    input.value = input.value.replace(/[^0-9.]/g, '');

}

function validateNumberInput(input) {
    // Menghapus karakter selain angka dan titik
    input.value = input.value.replace(/[^0-9.]/g, '');
}


function calculatePPHAmount() {
    let pphPercentage = parseFloat(document.getElementById('pph').value) || 0;
    let subtotal = parseRupiah(document.getElementById('subtotal').value) || 0;
    let pphAmount = (pphPercentage / 100) * subtotal;
    
    document.getElementById('pphAmount').value = formatRupiah(pphAmount.toFixed(2).toString());
    updateTotalAll();
}

function updateAmounts() {
    calculatePPNAmount();
    calculatePPHAmount();
    updateTotalAll();
}



function updateTotalAll() {
    let subtotal = parseRupiah(document.getElementById('subtotal').value) || 0;
    let ppnAmount = parseRupiah(document.getElementById('ppnAmount').value) || 0;
    let pphAmount = parseRupiah(document.getElementById('pphAmount').value) || 0;

    let pembulatan = parseRupiah(document.getElementById('pembulatan').value) || 0;

    
    let grandTotal = subtotal + ppnAmount - pphAmount + pembulatan;
    
    document.getElementById('totalall').value = formatRupiah(grandTotal.toFixed(2).toString());
}



 function addDecimals(input) {
            let value = input.value;

            // Hapus tanda titik atau koma ribuan sementara untuk pengecekan desimal
            let tempValue = value.replace(/\./g, '').replace(',', '.');

            if (!tempValue.includes('.')) {
                input.value = value + ',00';
            } else {
                let decimalPart = tempValue.split('.')[1];
                if (decimalPart.length === 1) {
                    input.value = value + '0';
                } else if (decimalPart.length === 0) {
                    input.value = value + '00';
                }
            }
        }

function savePo() {
    const nopo = document.getElementById('latestUrutan').value;
    const tglpo = document.getElementById('tglpo').value;
    const namasuplier = document.getElementById('namasuplier').value;
    const cp = document.getElementById('cp').value;
    const telp = document.getElementById('telp').value;
    const poco = document.getElementById('poco').value;
    const ppn = document.getElementById('ppn').value;
    const pph = document.getElementById('pph').value;
    const pphAmount = document.getElementById('pphAmount').value;
    const subtotal = document.getElementById('subtotal').value;
    const ppnAmount = document.getElementById('ppnAmount').value;
    const totalall = document.getElementById('totalall').value;
    const status = document.getElementById('status').value;
    const pembulatan = document.getElementById('pembulatan').value;
    const notes = document.getElementById('notes').value;

    const tableRows = document.querySelectorAll('#poTableBody tr');
    const items = [];
    let qtyExceeded = false;
    let incompleteItems = false;

    tableRows.forEach(row => {
        const nosp = row.cells[1].textContent.trim();
        const namabarang = row.cells[2].textContent.trim();
        const qtyInput = row.cells[3].querySelector('input[name="qty"]');
        let qty = qtyInput.value.trim();
        let satuan = row.cells[4].textContent.trim();
        const divisi = row.cells[5].textContent.trim();
        const priceInput = row.cells[6].querySelector('input[name="price"]');
        const price = priceInput.value.trim();
        const discountInput = row.cells[7].querySelector('input[name="discount"]');
        const discount = discountInput.value.trim();
        const discountAmount = row.cells[8].querySelector('input[name="discountAmount"]').value.trim();
        const totalprice = row.cells[9].querySelector('input[name="totalprice"]').value.trim();
        const kodeproduksi = row.cells[10].textContent.trim();
        const spk = row.cells[11].textContent.trim();
        let buatpoQty = parseFloat(qtyInput.dataset.buatpoqty);

        const namabarangList = ["THINNER A", "OLI TURALIK 52"];
        if (namabarangList.includes(namabarang.toUpperCase()) && qty == 1 && satuan === "Drum") {
            qty = 200;
            buatpoQty = 200;
            satuan = "Liter";
        }

        if (parseFloat(qty) > buatpoQty) {
            qtyInput.setCustomValidity(`Permintaan ${namabarang} tidak boleh melebihi ${buatpoQty}.`);
            qtyExceeded = true;
        } else {
            qtyInput.setCustomValidity('');
        }

        if (!qty || !price) {
            incompleteItems = true;
            qtyInput.setCustomValidity('Kuantitas harus diisi.');
            priceInput.setCustomValidity('Harga harus diisi.');
        } else {
            qtyInput.setCustomValidity('');
            priceInput.setCustomValidity('');
        }

        items.push({
            nosp, namabarang, qty, satuan, divisi,
            price, discount, discountAmount, totalprice,
            kodeproduksi, spk, buatpoQty
        });
    });

    if (qtyExceeded || incompleteItems) {
        alert(qtyExceeded ? 'Qty melebihi batas.' : 'Lengkapi kuantitas dan harga.');
        return;
    }

    if (!nopo || !tglpo || !namasuplier || !cp || !telp || !poco || !subtotal || !totalall) {
        alert('Silakan lengkapi semua data.');
        return;
    }

    let perubahanHargaItems = [];

    const priceCheckPromises = items.map(item => {
        return new Promise(resolve => {
            $.ajax({
                url: 'purchaselocal/get_last_price.php',
                type: 'POST',
                data: { namabarang: item.namabarang },
                dataType: 'json',
                success: function (response) {
                    const inputPrice = parseFloat(item.price.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.'));
                    const lastPrice = parseFloat(response.price.replace(/[^\d,]/g, '').replace(/\./g, '').replace(',', '.'));

                    if (!isNaN(lastPrice) && lastPrice > 0) {
                        const selisihPersen = ((inputPrice - lastPrice) / lastPrice) * 100;
                        if (Math.abs(selisihPersen) >= 1) {
                            perubahanHargaItems.push({
                                namabarang: item.namabarang,
                                lastPrice,
                                inputPrice,
                                selisihPersen
                            });
                        }
                    }
                    resolve();
                },
                error: function () {
                    resolve();
                }
            });
        });
    });

   Promise.all(priceCheckPromises).then(() => {
    const notif = perubahanHargaItems.map(item => {
        const arah = item.selisihPersen > 0 ? 'Naik' : 'Turun';
        const warna = item.selisihPersen > 0 ? '#f8d7da' : '#d4edda'; // merah muda atau hijau muda
        const warnaTeks = item.selisihPersen > 0 ? 'red' : 'green';

        return `
            <div style="background-color: ${warna}; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                <b>${item.namabarang}</b><br>
                Harga terakhir: Rp ${formatRupiah(item.lastPrice.toString())}<br>
                Harga baru: Rp ${formatRupiah(item.inputPrice.toString())}<br>
                Perubahan: <b style="color: ${warnaTeks}">${arah}</b> (${item.selisihPersen.toFixed(2)}%)
            </div>
        `;
    }).join('');

    if (notif) {
        Swal.fire({
            title: 'Perubahan Harga Terdeteksi',
            html: `${notif}<div style="margin-top:10px;">Tetap simpan PO ini?</div>`,
            icon: 'info',
            showCancelButton: true,
            confirmButtonText: 'Simpan',
            cancelButtonText: 'Batal',
        }).then(result => {
            if (result.isConfirmed) {
                kirimDataPO();
            }
        });
    } else {
        kirimDataPO();
    }
});



    function kirimDataPO() {
        const data = {
            nopo,
            tglpo,
            namasuplier,
            cp,
            telp,
            poco,
            ppn,
            pph,
            pphAmount,
            subtotal,
            ppnAmount,
            totalall,
            notes,
            status,
            pembulatan,
            items
        };

        $.ajax({
            type: 'POST',
            url: 'purchaselocal/save_po.php',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (response) {
                showNotification();
            },
            error: function () {
                alert('Gagal menyimpan PO.');
            }
        });
    }
}

// Format angka ke Rupiah
function formatRupiah(angka) {
    angka = parseFloat(angka).toFixed(2).toString();
    let parts = angka.split('.');
    let ribuan = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return ribuan + ',' + parts[1];
}

// Notifikasi sukses
function showNotification() {
    Swal.fire({
        title: 'Berhasil!',
        text: 'PO berhasil disimpan!',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
    }).then(() => {
        location.reload();
    });
}










function backToFirstModal() {
  $('#poModal').modal('hide');
  $('#exampleModalScrollable').modal('show');
}


$(document).ready(function() {
    // Inisialisasi Select2 untuk dropdown "namacustomer"
    $('#namasuplier').select2({
          width: '220px',
        placeholder: 'Search Suplier .....',
        ajax: {
            url: 'purchaselocal/namasuplier.php',
            dataType: 'json',
            delay: 250,
            data: function(params) {
                return {
                    q: params.term,
                    page: params.page
                };
            },
            processResults: function(data, params) {
                return {
                    results: data
                };
            },
            cache: true
        },
        escapeMarkup: function(markup) {
            return markup;
        },
        minimumInputLength: 0
    }).on('select2:select', function(e) {
        var namasuplier = e.params.data.text;

        // Mengisi nilai "CP" berdasarkan nama customer yang dipilih
        $.ajax({
            url: 'purchaselocal/namacp.php',
            dataType: 'json',
            data: { namasuplier: namasuplier },
            success: function(data) {
                // Menghapus opsi yang ada sebelumnya
                $('#cp').empty();

                // Menambahkan opsi baru berdasarkan data CP yang diterima
                $.each(data, function(index, item) {
                    $('#cp').append('<option value="' + item.id + '">' + item.text + '</option>');
                });

                // Memperbarui tampilan dropdown CP
                $('#cp').trigger('change');
            }
        });

        $('#telp').val(e.params.data.telp);

        // Mengaktifkan dropdown "CP"
        $('#cp').prop('disabled', false);
    }).on('select2:unselect', function(e) {
        // Ketika nilai dropdown "namacustomer" dihapus
        $('#cp').prop('disabled', true); // Menonaktifkan dropdown "CP" kembali
    });

    // Inisialisasi Select2 untuk dropdown "CP" dengan fitur "tags"
    $('#cp').select2({
        width: '220px',
        placeholder: 'Search or Add CP .....',
        tags: true, // Mengaktifkan fitur "tags"
        disabled: true // Menonaktifkan dropdown "CP" secara default
    });
});






 document.addEventListener('DOMContentLoaded', function() {
    const textarea = document.getElementById('notes');
    const displayNotes = document.getElementById('displayNotes');

    const initialText = [
      '* Surat Jalan harus di cantumkan No. PO',
      '* Barang di kirim ke JL. Plumpang Semper No. 50 (Seberang BANK BNI), Tlp 021/4370626',
      '* Jadwal Penerimaan Barang, Senin s/d Jumat , pukul 08.00 s/d 16.00 ',
    ].join('\n');

    textarea.value = initialText;
    updateDisplayNotes(initialText);

    textarea.addEventListener('input', function() {
      updateDisplayNotes(textarea.value);
    });

    function updateDisplayNotes(text) {
      const lines = text.split('\n');
      displayNotes.innerHTML = lines.map((line, index) => {
        if (index === 2) {
          return `<span class="bold">${line}</span>`;
        }
        return line;
      }).join('\n');
    }
  });

  document.getElementById('notes').addEventListener('keypress', function(event) {
    const textarea = event.target;
    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;

    if (event.key === 'Enter') {
      event.preventDefault();
      const value = textarea.value;
      textarea.value = value.substring(0, startPos) + '\n* ' + value.substring(endPos);
      textarea.selectionStart = textarea.selectionEnd = startPos + 3; // Move cursor to after '* '
      updateDisplayNotes(textarea.value);
    }
  });

  document.getElementById('notes').addEventListener('focus', function() {
    const textarea = event.target;
    if (textarea.value.length === 0) {
      textarea.value = '* ';
      textarea.selectionStart = textarea.selectionEnd = 2; // Move cursor to after '* '
    }
  });

  document.getElementById('notes').addEventListener('input', function() {
    const textarea = event.target;
    const lines = textarea.value.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].startsWith('* ')) {
        lines[i] = '* ' + lines[i];
      }
    }
    textarea.value = lines.join('\n');
  });
