$(document).ready(function () {
    // ==========================
    // Inisialisasi Select2 Utama
    // ==========================
    $('#class').select2({ 
        placeholder: 'Class',
        allowClear: true 
    });
    $.ajax({
        url: 'warehouse/get_classes.php',
        dataType: 'json',
        success: function(data) {
            $.each(data, function(index, value) {
                $('#class').append('<option value="' + value + '">' + value + '</option>');
            });
        }
    });

    $('#satuan').select2({ 
        placeholder: 'Unit',
        allowClear: true 
    });
    $.ajax({
        url: 'warehouse/get_mastersatuan.php',
        dataType: 'json',
        success: function(data) {
            $.each(data, function(index, value) {
                $('#satuan').append('<option value="' + value + '">' + value + '</option>');
            });
        }
    });

    // ==========================
    // Inisialisasi Select2 Edit
    // ==========================
    const select2Configs = [
        {id:'#classEdit', url:'warehouse/get_classs.php', placeholder:'Cari Class...'},
        {id:'#snEdit', url:'warehouse/get_sn.php', placeholder:'Cari SN...'},
        {id:'#tipeEdit', url:'warehouse/get_tipe.php', placeholder:'Cari Tipe...'},
        {id:'#satuanEdit', url:'warehouse/get_satuans.php', placeholder:'Cari Satuan...'}
    ];

    select2Configs.forEach(function(cfg){
        $(cfg.id).select2({
            ajax: {
                url: cfg.url,
                dataType: 'json',
                delay: 250,
                processResults: function(data){ return { results: data }; },
                cache: true
            },
            language: { searching: function(){ return 'Mencari...'; } },
            placeholder: cfg.placeholder,
            minimumInputLength: 0,
            allowClear: true
        });
    });

    // ==========================
    // Inisialisasi DataTables
    // ==========================
    $('#myTable, #dataTable, #dataTableHover').DataTable();
});

// ==========================
// Fungsi Open Modal Edit
// ==========================
function openEditModal(clickedElement) {
    const kodebarang = clickedElement.getAttribute('data-kodebarang');
    const namabarang = clickedElement.getAttribute('data-namabarang');
    const satuan = clickedElement.getAttribute('data-satuan');
    const itemalias = clickedElement.getAttribute('data-itemalias');
    const minimumstock = clickedElement.getAttribute('data-minimumstock');
    const maxstock = clickedElement.getAttribute('data-maxstock');
    const tipe = clickedElement.getAttribute('data-tipe');
    const classValue = clickedElement.getAttribute('data-class');
    const snData = clickedElement.getAttribute('data-sn') || '';

    
    const nama = namaLogin || 'Seseorang';


    // Set input modal
    $("#kodebarangEdit").val(kodebarang);
    $("#namabarangEdit").val(namabarang);
    $("#itemaliasEdit").val(itemalias);
    $("#minimumstockEdit").val(minimumstock);
    $("#maxstockEdit").val(maxstock);
    $("#namaEdit").val(namaLogin); // ambil dari login

    // Set Select2
    $("#satuanEdit").empty().append(new Option(satuan, satuan, true, true)).trigger('change');
    $("#classEdit").empty().append(new Option(classValue, classValue, true, true)).trigger('change');

    // Set SN
    const snArray = snData ? snData.split(',') : [];
    $("#snEdit").empty();
    snArray.forEach(val => { $("#snEdit").append(new Option(val, val, true, true)); });
    $("#snEdit").trigger('change');

    // Set Tipe
    const tipeArray = tipe ? tipe.split(',') : [];
    $("#tipeEdit").empty();
    tipeArray.forEach(val => { $("#tipeEdit").append(new Option(val, val, true, true)); });
    $("#tipeEdit").trigger('change');

    // Tampilkan modal
    $("#exampleModalScrollable").modal("show");
}

// ==========================
// Fungsi Simpan Perubahan
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
        sn: $("#snEdit").val(),
        nama: $("#namaEdit").val() // ini yang penting agar tersimpan
    };

    // Validasi
    if (!data.namabarang || !data.itemalias || !data.classValue || !data.satuan || !data.tipe || !data.sn || !data.minimumstock || !data.maxstock){
        alert("Lengkapi semua data sebelum menyimpan perubahan!");
        return;
    }

    if (parseInt(data.maxstock) < parseInt(data.minimumstock)){
        alert("Nilai MaxStock harus lebih besar atau sama dengan MinimumStock!");
        return;
    }

    $.ajax({
        type: "POST",
        url: "warehouse/updatedatamaster.php",
        data: data,
        success: function(response){
            console.log(response);
            $("#exampleModalScrollable").modal("hide");
            alert("Perubahan berhasil disimpan!");
            location.reload();
        },
        error: function(err){
            console.error(err);
            alert("Terjadi kesalahan saat menyimpan perubahan. Mohon coba lagi.");
        }
    });
}
