$(document).ready(function () {
    // Inisialisasi DataTables (penting!)
    var table = $('#dataTable').DataTable();

    // Inisialisasi Select2 seperti kode kamu
    $('#menu_key').select2({
        placeholder: "Pilih Menu",
        allowClear: true,
        tags: true,
        width: '100%',
        ajax: {
            url: 'menu_list.php',
            dataType: 'json',
            delay: 250,
            processResults: function (data) {
                return {
                    results: data.map(function (item) {
                        return { id: item, text: item };
                    })
                };
            },
            cache: true
        }
    });



$(function () {
  // Klik tombol Edit
  $(document).on('click', '.btn-edit', function () {
    var userId = $(this).data('id');

    $.ajax({
      url: 'get_user_detail.php',
      type: 'GET',
      data: { id: userId },
      dataType: 'json',
      success: function (res) {
        if (res.status !== 'success') {
          Swal.fire('Error', res.message || 'Gagal memuat data', 'error');
          return;
        }

        const d = res.data || {};
        $('#edit_id').val(d.id || '');
        $('#edit_nama').val(d.nama || '');

        const allMenus = d.all_menus || [];
        const accessMap = d.access || {}; // {menu_key: 'viewer'|'editor'|undefined}

        const $container = $('#menuFeatureContainer').empty();

        if (!allMenus.length) {
          $container.append('<div class="text-muted p-3">Belum ada daftar menu.</div>');
        } else {
          allMenus.forEach(function (menuKey, idx) {
            const current = accessMap[menuKey] || 'none';
            const rowHtml = `
              <div class="perm-row">
                <div class="menu-title">${escapeHtml(menuKey)}</div>
                <div class="text-center">
                  <div class="btn-group" role="group" aria-label="Akses ${menuKey}">
                    <input type="radio" class="btn-check" name="perm[${menuKey}]" id="none_${idx}" value="none" ${current==='none'?'checked':''}>
                    <label class="btn btn-outline-secondary" for="none_${idx}">None</label>

                    <input type="radio" class="btn-check" name="perm[${menuKey}]" id="viewer_${idx}" value="viewer" ${current==='viewer'?'checked':''}>
                    <label class="btn btn-outline-info" for="viewer_${idx}">Viewer</label>

                    <input type="radio" class="btn-check" name="perm[${menuKey}]" id="editor_${idx}" value="editor" ${current==='editor'?'checked':''}>
                    <label class="btn btn-outline-primary" for="editor_${idx}">Editor</label>
                  </div>
                </div>
              </div>`;
            $container.append(rowHtml);
          });
        }

        $('#modalEdit').modal('show');
      },
      error: function () {
        Swal.fire('Error', 'Gagal menghubungi server', 'error');
      }
    });
  });

  // Submit Simpan
  $('#formEditUser').on('submit', function (e) {
    e.preventDefault();
    const formData = $(this).serialize();

    $.ajax({
      url: 'update_user.php',
      type: 'POST',
      data: formData,
      dataType: 'json',
      success: function (res) {
        if (res.status === 'success') {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Akses diperbarui', timer: 1600, showConfirmButton: false });
          $('#modalEdit').modal('hide');

          // Optional: update kolom "Menu Access & Feature" pada baris yang diedit
          const idUser = $('#edit_id').val();
          const perms = collectPermsFromForm('#formEditUser');
          const formatted = formatPermsForCell(perms);
          const $row = $("button.btn-edit[data-id='" + idUser + "']").closest('tr');
          $row.find('td').eq(3).html(formatted);
        } else {
          Swal.fire('Error', res.message || 'Gagal menyimpan perubahan', 'error');
        }
      },
      error: function () {
        Swal.fire('Error', 'Terjadi kesalahan saat menyimpan', 'error');
      }
    });
  });

  // Helpers
  function escapeHtml(s) {
    return (s || '').replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]);
    });
  }

  function collectPermsFromForm(formSelector) {
    const map = {};
    $(`${formSelector} input[type=radio]:checked`).each(function () {
      const name = $(this).attr('name'); // perm[menu_key]
      const val = $(this).val();         // none/viewer/editor
      const key = name.substring(5, name.length - 1); // ambil menu_key di dalam []
      map[key] = val;
    });
    return map;
  }

  function formatPermsForCell(perms) {
    const lines = [];
    let i = 1;
    Object.keys(perms).sort().forEach(function (k) {
      const v = perms[k];
      if (v && v !== 'none') {
        lines.push(`${i}. ${escapeHtml(k)} = ${v.charAt(0).toUpperCase() + v.slice(1)}`);
        i++;
      }
    });
    return lines.length ? lines.join('<br>') : '<em>Belum Memiliki Akses Apapun</em>';
  }
});
