$(document).ready(function () {
  // Inisialisasi DataTable
  var table = $('#dataTable').DataTable();

  // Optional: inisialisasi select2 (jika masih dipakai di tempat lain)
  if ($.fn.select2) {
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
            results: data.map(function (item) { return { id: item, text: item }; })
          };
        },
        cache: true
      }
    });
  }

  // Helper: safe escape html
  function escapeHtml(s) {
    return (s || '').toString().replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]);
    });
  }

  // Helper: show modal compatible BS4/BS5
  function showModal() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modalEl = document.getElementById('modalEdit');
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      $('#modalEdit').modal('show');
    }
  }
  function hideModal() {
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
      const modalEl = document.getElementById('modalEdit');
      const modal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
      modal.hide();
    } else {
      $('#modalEdit').modal('hide');
    }
  }

  // Klik tombol Edit (delegation)
  $(document).on('click', '.btn-edit', function () {
    var userId = $(this).data('id');
    if (!userId) return;

    $.ajax({
      url: 'get_user_detail.php',
      method: 'GET',
      data: { id: userId },
      dataType: 'json'
    }).done(function (res) {
      if (!res || res.status !== 'success') {
        Swal.fire('Error', (res && res.message) ? res.message : 'Gagal memuat data', 'error');
        return;
      }

      const d = res.data || {};
      $('#edit_id').val(d.id || '');
      $('#edit_nama').val(d.nama || '');

      // all_menus : array of menu_key
      // access : object mapping menu_key => 'viewer'|'editor'
      const allMenus = d.all_menus || [];
      const accessMap = d.access || {};

      const $container = $('#menuFeatureContainer').empty();

      if (!allMenus.length) {
        $container.append('<div class="text-muted p-3">Belum ada daftar menu.</div>');
      } else {
        allMenus.forEach(function (menuKey, idx) {
          const current = (accessMap[menuKey] ? accessMap[menuKey].toLowerCase() : 'none');

          // safe ids (use idx to keep unique)
          const idNone = 'perm_none_' + idx;
          const idViewer = 'perm_viewer_' + idx;
          const idEditor = 'perm_editor_' + idx;

          const rowHtml = `
            <div class="perm-row">
              <div class="menu-title">${escapeHtml(menuKey)}</div>
              <div class="text-center">
                <input type="hidden" name="menu_keys[]" value="${escapeHtml(menuKey)}">
                <div class="btn-group" role="group" aria-label="Akses ${escapeHtml(menuKey)}">
                  <input type="radio" class="btn-check" name="perm_values[${idx}]" id="${idNone}" value="none" ${current==='none'?'checked':''}>
                  <label class="btn btn-outline-secondary" for="${idNone}">None</label>

                  <input type="radio" class="btn-check" name="perm_values[${idx}]" id="${idViewer}" value="viewer" ${current==='viewer'?'checked':''}>
                  <label class="btn btn-outline-info" for="${idViewer}">Viewer</label>

                  <input type="radio" class="btn-check" name="perm_values[${idx}]" id="${idEditor}" value="editor" ${current==='editor'?'checked':''}>
                  <label class="btn btn-outline-primary" for="${idEditor}">Editor</label>
                </div>
              </div>
            </div>
          `;
          $container.append(rowHtml);
        });
      }

      showModal();
    }).fail(function () {
      Swal.fire('Error', 'Gagal menghubungi server', 'error');
    });
  });

  // Submit form (update)
  $('#formEditUser').on('submit', function (e) {
    e.preventDefault();

    // simple validation
    const id = $('#edit_id').val();
    if (!id) {
      Swal.fire('Error', 'ID user tidak ditemukan', 'error');
      return;
    }

    // send form via AJAX
    $.ajax({
      url: 'update_user.php',
      method: 'POST',
      data: $(this).serialize(),
      dataType: 'json'
    }).done(function (res) {
      if (!res) {
        Swal.fire('Error', 'Response tidak valid', 'error');
        return;
      }
      if (res.status === 'success') {
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Akses diperbarui', timer: 1400, showConfirmButton: false });
        hideModal();

        // update cell di tabel tanpa reload
        const idUser = id;
        const perms = collectPermsFromForm('#formEditUser');
        const formatted = formatPermsForCell(perms);
        const $row = $("button.btn-edit[data-id='" + idUser + "']").closest('tr');
        if ($row && $row.length) {
          // kolom ke-4 (index 3) seperti sebelumnya
          $row.find('td').eq(3).html(formatted);
        } else {
          // jika pakai DataTables dan row tidak dapat ditemukan, reload tabel
          try { table.ajax && table.ajax.reload(null, false); } catch (e) {}
        }

      } else {
        Swal.fire('Error', res.message || 'Gagal menyimpan perubahan', 'error');
      }
    }).fail(function () {
      Swal.fire('Error', 'Terjadi kesalahan saat menyimpan', 'error');
    });
  });

  // Ambil data dari form menjadi mapping menu => value
  function collectPermsFromForm(formSelector) {
    const map = {};
    // menu_keys[] order aligns with perm_values[index]
    $(formSelector + ' input[name="menu_keys[]"]').each(function (i) {
      const menu = $(this).val();
      const selected = $(formSelector + ' input[name="perm_values[' + i + ']"]:checked').val() || 'none';
      map[menu] = selected;
    });
    return map;
  }

  // Format menjadi string untuk cell
  function formatPermsForCell(perms) {
    const lines = [];
    let i = 1;
    Object.keys(perms).sort().forEach(function (k) {
      const v = perms[k];
      if (v && v !== 'none') {
        lines.push(i + ". " + escapeHtml(k) + " = " + (v.charAt(0).toUpperCase() + v.slice(1)));
        i++;
      }
    });
    return lines.length ? lines.join('<br>') : '<em>Belum Memiliki Akses Apapun</em>';
  }
});
