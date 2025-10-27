


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

        var price = `<input type="text" class="price" autocomplete="off" id="price${index}" required name="price" oninput="formatOnInput(this, ${index})" onblur="onBlurAddComma(event,${index});" >`;
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
    return rupiah;
}



function updateTotalPrice(element, index) {

    let qty = parseFloat(document.getElementById('qty' + index).value.replace(/[^0-9]/g, '')) || 0;
    let price = parseRupiah(document.getElementById('price' + index).value) || 0;

    // Mendapatkan nilai input diskon dan menghapus karakter selain angka dan koma
    let discountInput = document.getElementById('discount' + index).value;
    let sanitizedDiscountInput = discountInput.replace(/[^0-9,.]/g, ''); // Hanya mengizinkan angka dan koma

    // Mengganti koma sebagai pemisah desimal jika ada
    let discount = parseFloat(sanitizedDiscountInput.replace(',', '.')) || 0;

    // Update nilai input diskon dengan versi yang sudah divalidasi
    document.getElementById('discount' + index).value = sanitizedDiscountInput;

    // Hitung diskon dalam nilai absolut
    let discountAmount = (price * qty) * (discount / 100);
    
    // Hitung total harga setelah diskon
    let totalPrice = (price * qty) - discountAmount;

    // Update nilai diskon dan total harga dalam elemen input
    document.getElementById('discountAmount' + index).value = formatRupiah(discountAmount.toFixed(2).toString());
    document.getElementById('totalprice' + index).value = formatRupiah(totalPrice.toFixed(2).toString());

    // Panggil fungsi untuk mengupdate subtotal setelah memperbarui total harga
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
        element.value = value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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

function formatNumber(value) {
        const parts = value.split(',');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, "."); // Format ribuan

        // Batasi jumlah angka setelah koma
        if (parts[1]) {
            parts[1] = parts[1].substring(0, 2); // Ambil hanya dua angka setelah koma
        }

        return parts.join(','); // Gabungkan kembali dengan koma
    }
function onInputChange(event) {
    const input = event.target;

    // Menggunakan regex untuk hanya mengizinkan angka dan koma
    const filteredValue = input.value.replace(/[^0-9,]/g, '');

    // Update nilai input dengan nilai yang difilter
    input.value = filteredValue;

    // Format dan update nilai
    const rawValue = filteredValue;
    const formattedValue = formatNumber(rawValue);
    input.value = formattedValue;

    // Panggil fungsi lain jika diperlukan
    calculatePPHAmount();
}

function onBlurAddComma(event) {
    const input = event.target;
    const value = input.value.trim();

    // Cek apakah ada koma di nilai input
    if (!value.includes(',')) {
        // Tambahkan ,00 jika tidak ada koma
        input.value = value + ',00';
    }
}

function updateTotalAll() {
    let subtotal = parseRupiah(document.getElementById('subtotal').value) || 0;
    let ppnAmount = parseRupiah(document.getElementById('ppnAmount').value) || 0;
    let pphAmount = parseRupiah(document.getElementById('pphAmount').value) || 0;
    let pembulatan = parseRupiah(document.getElementById('pembulatan').value) || 0;
    let bankcharge = parseRupiah(document.getElementById('bankcharge').value) || 0;
    let packingcharge = parseRupiah(document.getElementById('packingcharge').value) || 0;
    let localcharge = parseRupiah(document.getElementById('localcharge').value) || 0;
    let shippingcharge = parseRupiah(document.getElementById('shippingcharge').value) || 0;

    let insurancecharge = parseRupiah(document.getElementById('insurancecharge').value) || 0;


    let grandTotal = subtotal + ppnAmount - pphAmount + pembulatan + bankcharge + packingcharge + localcharge + shippingcharge + insurancecharge;

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

    const currency = document.getElementById('currency').value;
    const bankcharge = document.getElementById('bankcharge').value;
    const packingcharge = document.getElementById('packingcharge').value;
    const localcharge = document.getElementById('localcharge').value;
    const shippingcharge = document.getElementById('shippingcharge').value;
    const shippingterms = document.getElementById('shippingterms').value;
    const shippingcarrier = document.getElementById('shippingcarrier').value;
    const paymentterms = document.getElementById('paymentterms').value;

    const cifselect = document.getElementById('cifselect').value;
    const insurancecharge = document.getElementById('insurancecharge').value;
    const cifterms = document.getElementById('cifterms').value;

    const tableRows = document.querySelectorAll('#poTableBody tr');
    const items = [];

    let qtyExceeded = false;
    let incompleteItems = false;

    const namabarangList = ["THINNER A", "OLI TURALIK 52"];

    tableRows.forEach(row => {
        const nosp = row.cells[1].textContent.trim();
        const namabarang = row.cells[2].textContent.trim().toUpperCase();
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

        if (namabarangList.includes(namabarang) && qty == 1 && satuan === "Drum") {
            qty = 200;
            buatpoQty = 200;
            satuan = "Liter";
            console.log(`Setelah modifikasi: ${namabarang}, qty=${qty}, satuan=${satuan}`);
        } else {
            console.log(`Sebelum modifikasi: ${namabarang}, qty=${qty}, satuan=${satuan}`);
        }

        if (parseFloat(qty) > buatpoQty) {
            qtyInput.setCustomValidity(`Qty untuk ${namabarang} tidak boleh melebihi ${buatpoQty}.`);
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
            nosp, namabarang, qty, satuan, divisi, price, discount,
            discountAmount, totalprice, kodeproduksi, spk, buatpoQty
        });
    });

    if (qtyExceeded) {
        const item = items.find(i => parseFloat(i.qty) > parseFloat(i.buatpoQty));
        alert(`Qty untuk NO SP ${item.nosp} (${item.namabarang}) tidak boleh melebihi ${item.buatpoQty}.`);
        return;
    }

    if (incompleteItems) {
        alert('Silakan lengkapi kuantitas dan harga untuk semua item.');
        return;
    }

    if (!nopo || !tglpo || !namasuplier || !cp || !telp || !poco || !subtotal || !totalall) {
        alert('Silakan lengkapi semua data yang diperlukan.');
        return;
    }

    const perubahanHargaItems = [];

    const priceCheckPromises = items.map(item => {
        return new Promise(resolve => {
            $.ajax({
                url: 'purchaseimport/get_last_price.php',
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
            const warna = item.selisihPersen > 0 ? '#f8d7da' : '#d4edda';
            const warnaTeks = item.selisihPersen > 0 ? 'red' : 'green';

            return `
                <div style="background-color: ${warna}; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                    <b>${item.namabarang}</b><br>
                    Harga terakhir :  ${formatRupiah(item.lastPrice.toString())}<br>
                    Harga Pengajuan :  ${formatRupiah(item.inputPrice.toString())}<br>
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
            nopo, tglpo, namasuplier, cp, telp, poco, ppn, pph, pphAmount,
            subtotal, ppnAmount, totalall, notes, status, pembulatan,
            currency, bankcharge, packingcharge, localcharge, shippingcharge,
            shippingterms, shippingcarrier, paymentterms,
            cifselect, insurancecharge, cifterms,
            items
        };

        console.log(data);

        $.ajax({
            type: 'POST',
            url: 'purchaseimport/save_po.php',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function (response) {
                showNotification();
                console.log(response);
            },
            error: function (xhr, status, error) {
                console.error(error);
                alert('Gagal menyimpan detail PO. Silakan coba lagi.');
            }
        });
    }
}

// Format angka ke format Rupiah (dengan koma desimal)
function formatRupiah(angka) {
    angka = parseFloat(angka).toFixed(2).toString();
    const parts = angka.split('.');
    const ribuan = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
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
            url: 'purchaseimport/namasuplier.php',
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
            url: 'purchaseimport/namacp.php',
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





    $(document).ready(function() {
        $('#currency').select2({
            placeholder: "Select Currency",
            allowClear: true
        });

        // Mengatur padding dan tinggi dropdown Select2
        $('#currency').next('.select2-container').find('.select2-selection').css({
            paddingTop: '5px', // Atur padding sesuai kebutuhan
            height: '40px'      // Atur tinggi sesuai kebutuhan
        });
    });



    $(document).ready(function() {
        $('#cifselect').select2({
            placeholder: "Select One",
            allowClear: true
        });

        // Mengatur padding dan tinggi dropdown Select2
        $('#cifselect').next('.select2-container').find('.select2-selection').css({
            paddingTop: '5px', // Atur padding sesuai kebutuhan
            height: '40px'      // Atur tinggi sesuai kebutuhan
        });
    });



