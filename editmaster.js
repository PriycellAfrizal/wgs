$(document).ready(function () {
    // ==========================
    // Helper untuk Select2 Init
    // ==========================
    function initSelect2Static(selector, url, placeholder) {
        if ($(selector).length) {
            $(selector).select2({
                placeholder: placeholder,
                allowClear: true
            });
            $.ajax({
                url: url,
                dataType: "json",
                success: function (data) {
                    $(selector).empty();
                    $.each(data, function (i, val) {
                        $(selector).append(
                            $("<option>", { value: val, text: val })
                        );
                    });
                }
            });
        }
    }

    function initSelect2Ajax(selector, url, placeholder) {
        if ($(selector).length) {
            $(selector).select2({
                ajax: {
                    url: url,
                    dataType: "json",
                    delay: 250,
                    processResults: function (data) {
                        return { results: data };
                    },
                    cache: true
                },
                language: {
                    searching: () => "Mencari...",
                    noResults: () => "Tidak ditemukan hasil"
                },
                placeholder: placeholder,
                minimumInputLength: 0,
                allowClear: true
            });
        }
    }

    // ==========================
    // Inisialisasi Select2 Utama
    // ==========================
    initSelect2Static("#class", "warehouse/get_classes.php", "Class");
    initSelect2Static("#satuan", "warehouse/get_mastersatuan.php", "Unit");

    // ==========================
    // Inisialisasi Select2 Edit
    // ==========================
    initSelect2Ajax("#classEdit", "warehouse/get_classs.php", "Cari Class...");
    initSelect2Ajax("#snEdit", "warehouse/get_sn.php", "Cari SN...");
    initSelect2Ajax("#tipeEdit", "warehouse/get_tipe.php", "Cari Tipe...");
    initSelect2Ajax("#satuanEdit", "warehouse/get_satuans.php", "Cari Satuan...");

    // ==========================
    // Inisialisasi DataTables
    // ==========================
    $("#myTable, #dataTable, #dataTableHover").DataTable({
        ordering: false,
        searching: true,
        paging: true,
        info: true,
        pageLength: 20
    });
});

// ==========================
// Fungsi Open Modal Edit
// ==========================
function openEditModal(el) {
    const kodebarang   = $(el).data("kodebarang");
    const namabarang   = $(el).data("namabarang");
    const satuan       = $(el).data("satuan");
    const itemalias    = $(el).data("itemalias");
    const minimumstock = $(el).data("minimumstock");
    const maxstock     = $(el).data("maxstock");
    const tipe         = $(el).data("tipe") || "";
    const classValue   = $(el).data("class") || "";
    const snData       = $(el).data("sn") || "";

    // Isi form
    $("#kodebarangEdit").val(kodebarang);
    $("#namabarangEdit").val(namabarang);
    $("#itemaliasEdit").val(itemalias);
    $("#minimumstockEdit").val(minimumstock);
    $("#maxstockEdit").val(maxstock);

    // Select2 - single value
    setSelect2Value("#satuanEdit", satuan);
    setSelect2Value("#classEdit", classValue);

    // Select2 - multiple value
    setSelect2Multiple("#snEdit", snData.split(","));
    setSelect2Multiple("#tipeEdit", tipe.split(","));

    $("#exampleModalScrollable").modal("show");
}

function setSelect2Value(selector, value) {
    const el = $(selector);
    el.empty();
    if (value) {
        el.append(new Option(value, value, true, true)).trigger("change");
    }
}

function setSelect2Multiple(selector, values) {
    const el = $(selector);
    el.empty();
    if (Array.isArray(values)) {
        values.forEach(val => {
            if (val) {
                el.append(new Option(val, val, true, true));
            }
        });
    }
    el.trigger("change");
}

// ==========================
// Fungsi Save
// ==========================

function saveChanges() {
    const data = {
        kodebarang: $("#kodebarangEdit").val(),
        namabarang: $("#namabarangEdit").val(),
        satuan: $("#satuanEdit").val(),
        itemalias: $("#itemaliasEdit").val(),
        minimumstock: $("#minimumstockEdit").val(),
        maxstock: $("#maxstockEdit").val(),
        tipe: $("#tipeEdit").val(),
        classValue: $("#classEdit").val(),
        sn: $("#snEdit").val()
        // nama edit otomatis dari session PHP
    };

    // Validasi form sederhana
    if (!data.namabarang || !data.itemalias || !data.classValue || !data.satuan ||
        !data.tipe || !data.sn || !data.minimumstock || !data.maxstock) {
        Swal.fire("Peringatan", "Lengkapi semua data sebelum menyimpan!", "warning");
        return;
    }

    if (parseInt(data.maxstock) < parseInt(data.minimumstock)) {
        Swal.fire("Peringatan", "Nilai MaxStock harus lebih besar atau sama dengan MinimumStock!", "warning");
        return;
    }

    $.ajax({
        type: "POST",
        url: "warehouse/updatedatamaster.php",
        data: data,
        dataType: "json", // <-- penting, supaya response langsung jadi object
        success: function(response) {
            console.log("Server Response:", response);

            if (response.success) {
                Swal.fire({
                    title: "Berhasil",
                    text: response.message,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    $("#exampleModalScrollable").modal("hide");
                    location.reload();
                });
            } else {
                Swal.fire({
                    title: "Gagal",
                    text: response.message,
                    icon: "error",
                    width: "700px"
                });
            }
        },
        error: function(xhr, status, error) {
            console.error("AJAX Error:", error, xhr.responseText);
            Swal.fire("Kesalahan", "Tidak dapat terhubung ke server", "error");
        }
    });
}

