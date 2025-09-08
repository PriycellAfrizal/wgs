$(document).ready(function () {
  // Inisialisasi Select2 untuk namabarang
  $('.namabarang').select2({
    ajax: {
      url: 'produksi/get_namabarangbplant.php',
      dataType: 'json',
      delay: 250,
      processResults: function (data) {
        return { results: data };
      },
      cache: true
    },
    language: {
      searching: function () { return 'Mencari...'; },
      noResults: function () { return 'Tidak ditemukan hasil'; }
    },
    placeholder: 'Cari nama barang...',
    allowClear: true,
    minimumInputLength: 0
  });

  // Event saat pilihan berubah
  $(document).on('change', '.namabarang', function () {
    let namabarang = $(this).val();
    let row = $(this).closest('tr');

    $.ajax({
      url: 'produksi/get_satuan.php',
      method: 'GET',
      dataType: 'json',
      data: { namabarang: namabarang },
      success: function (response) {
        row.find('.satuan').val(response.satuan);
      },
      error: function () {
        console.error('Gagal ambil data satuan');
      }
    });
  });
});
