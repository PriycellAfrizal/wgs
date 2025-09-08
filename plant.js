$(document).ready(function () {
    // === DataTables Initialization ===
    $('#myTable, #dataTable, #dataTableHover').DataTable();

    // === Select2 for Divisi ===
    $('.divisi').select2({
        ajax: {
            url: 'produksi/get_divisi.php',
            dataType: 'json',
            delay: 250,
            processResults: data => ({ results: data }),
            cache: true
        },
        placeholder: 'Search Divisi...',
        minimumInputLength: 0,
        allowClear: true,
        language: {
            searching: () => 'Searching...',
            noResults: () => 'Tidak ditemukan hasil'
        }
    });

    // === Select2 for Namabarang (Global) ===
    $('.namabarang').select2({
        ajax: {
            url: 'produksi/get_namabarangbplant.php',
            dataType: 'json',
            delay: 250,
            data: params => ({ q: params.term }),
            processResults: data => ({ results: data }),
            cache: true
        },
        placeholder: 'Cari nama barang...',
        minimumInputLength: 0,
        allowClear: true,
        language: {
            searching: () => 'Mencari...',
            noResults: () => 'Tidak ditemukan hasil'
        }
    }).on('change', function () {
        let namabarang = $(this).val();
        if (namabarang) {
            $.ajax({
                url: 'produksi/get_satuan.php',
                method: 'GET',
                dataType: 'json',
                data: { namabarang },
                success: function (response) {
                    if (response && response.satuan) {
                        $('.satuan').val(response.satuan);
                    }
                },
                error: err => console.error('Gagal ambil data satuan:', err)
            });
        } else {
            $('.satuan').val('');
        }
    });

    // === Save Button (Modal) ===
    $(".btn-save").click(function () {
        let kodeproduksi = $("#tableBody td:nth-child(1)").text();
        let tipeproduksi = $("#tableBody select[name='tipeproduksi']").val();
        let status = $("#tableBody input[name='status']").val();
        let assembling = $("#tableBody input[name='assembling']").val();
        let finishing = $("#tableBody input[name='finishing']").val();
        let twinshaft = $("#tableBody input[name='twinshaft']").val();

        $.ajax({
            type: "POST",
            url: "produksi/update_bplant.php",
            data: { kodeproduksi, tipeproduksi, status, assembling, finishing, twinshaft },
            success: function (response) {
                swal({
                    title: "Success!",
                    text: response,
                    icon: "success",
                    button: false
                });
                setTimeout(() => location.reload(), 1000);
            },
            error: err => {
                console.error(err);
                alert("Failed to update record. Please try again later.");
            }
        });
    });
});

// === Edit Record ===
function editRecord(kodeproduksi) {
    if (!kodeproduksi) {
        console.error("kodeproduksi kosong/null");
        return;
    }

    $.ajax({
        url: 'produksi/ambilproduksibplant.php',
        method: 'POST',
        data: { kodeproduksi },
        success: function (response) {
            $('#tableBody').html(response);
            $('#ModalProduksi').modal('show');

            $.ajax({
                url: 'produksi/get_namabarangbplant.php',
                method: 'GET',
                dataType: 'json',
                success: function (data) {
                    $('.tipeproduksi-select2').select2({
                        placeholder: 'Select Type Produksi',
                        data,
                        width: '100%'
                    });
                },
                error: err => {
                    console.error(err);
                    alert('Failed to fetch tipeproduksi data.');
                }
            });
        },
        error: err => {
            console.error(err);
            alert('Failed to fetch data.');
        }
    });
}

// === Show History ===
function showHistory(nosp) {
    $.ajax({
        type: "POST",
        url: "produksi/get_Historysp.php",
        data: { nosp },
        success: response => {
            $('#historyModal .modal-body').html(response);
            $('#historyModal').modal('show');
        },
        error: err => console.error("Error:", err)
    });
}

// === Fetch KodeBarang ===
function fetchKodeBarang() {
    let selectedNamabarang = $("#namabarang").val();
    $.ajax({
        type: "GET",
        url: "produksi/get_kodebarang.php",
        data: { namabarang: selectedNamabarang },
        dataType: 'json',
        success: response => $("#kodebarang").val(response.kodebarang),
        error: err => console.error(err)
    });
}

// === Save All Data (Multiple Rows) ===
function saveAllData() {
    let rows = document.querySelectorAll("#tableBody tr");
    let data = [];
    let isValid = true;

    rows.forEach(row => {
        let kodeProduksi = row.cells[0].querySelector("input")?.value || "";
        let tipeProduksi = row.cells[1].querySelector("select")?.value || "";

        if (!kodeProduksi.trim() || !tipeProduksi.trim()) {
            isValid = false;
            alert("Please fill in all required fields before saving.");
            return;
        }

        data.push({ kodeProduksi, tipeProduksi });
    });

    if (isValid) {
        $.ajax({
            type: "POST",
            url: "produksi/savebplant.php",
            data: { data },
            dataType: 'json',
            success: response => {
                console.log(response);
                alert("Data saved successfully!");
                location.reload();
            },
            error: err => {
                console.error(err);
                alert("Error while saving data.");
            }
        });
    }
}

// === Update Satuan (Umum) ===
function updateSatuan(selectElement) {
    let namabarang = selectElement.val();
    $.ajax({
        url: 'produksi/get_satuandata.php',
        method: 'GET',
        dataType: 'json',
        data: { namabarang },
        success: response => {
            let row = selectElement.closest('tr');
            row.find('.satuan, .satuanadd').val(response.satuan);
        },
        error: () => console.log('Failed to fetch satuan data')
    });
}

// === Cari SPK ===
function carispk(selectElement) {
    let selectedKodeProduksi = $(selectElement).val();
    $.ajax({
        type: "GET",
        url: "produksi/get_spk.php",
        data: { kodeproduksi: selectedKodeProduksi },
        dataType: 'json',
        success: response => {
            $(selectElement).closest('tr').find('.spk, .nospk').val(response.spk);
        },
        error: err => console.error(err)
    });
}

// === Delete Row ===
function deleteRow() {
    let table = document.querySelector(".table-sp tbody");
    if (table.rows.length > 1) table.deleteRow(table.rows.length - 1);
}
