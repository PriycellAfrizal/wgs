// app-user-management.js
$(document).ready(function () {
  // -------------------------
  // Init DataTable (jika ada)
  // -------------------------
  var table = null;
  if ($.fn.DataTable && $('#dataTable').length) {
    try {
      table = $('#dataTable').DataTable();
    } catch (e) {
      console.warn('DataTable init failed:', e);
    }
  }

  // -------------------------
  // Init select2 (jika ada elemen dan plugin)
  // -------------------------
  if ($.fn.select2 && $('#menu_key').length) {
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
          // pastikan data array
          data = Array.isArray(data) ? data : [];
          return {
            results: data.map(function (item) { return { id: item, text: item }; })
          };
        },
        cache: true
      }
    });
  }

  // -------------------------
  // Helpers
  // -------------------------
  function escapeHtml(s) {
    return (s || '').toString().replace(/[&<>"']/g, function (m) {
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]);
    });
  }

  function showModal() {
    // support BS5 and fallback to jQuery/BS4
    var el = document.getElementById('modalEdit');
    if (!el) return;
    if (window.bootstrap && bootstrap.Modal) {
      var inst = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
      inst.show();
    } else {
      $('#modalEdit').modal('show');
    }
  }

  function hideModal() {
    var el = document.getElementById('modalEdit');
    if (!el) return;
    if (window.bootstrap && bootstrap.Modal) {
      var inst = bootstrap.Modal.getInstance(el) || new bootstrap.Modal(el);
      inst.hide();
    } else {
      $('#modalEdit').modal('hide');
    }
  }

  function showError(title, message) {
    if (window.Swal) {
      Swal.fire(title || 'Error', message || 'Terjadi kesalahan', 'error');
    } else {
      alert((title ? title + '\n' : '') + (message || 'Error'));
    }
  }

  // -------------------------
  // Click Edit button (delegated)
  // -------------------------
  $(document).on('click', '.btn-edit', function (e) {
    e.preventDefault();
    var userId = $(this).data('id');
    if (!userId) {
      showError('Error', 'ID user tidak ditemukan pada tombol edit.');
      return;
    }

    // Ajukan request ke server
    $.ajax({
      url: 'get_user_detail.php',
      method: 'GET',
      data: { id: userId },
      dataType: 'json',
      timeout: 8000,
      beforeSend: function () {
        // optional: show loading indicator
      }
    })
    .done(function (res) {
      if (!res || res.status !== 'success') {
        var msg = (res && res.message) ? res.message : 'Gagal memuat data user.';
        showError('Gagal memuat data', msg);
        return;
      }

      // isi form modal
      var d = res.data || {};
      $('#edit_id').val(d.id || '');
      $('#edit_nama').val(d.nama || '');

      // Support both possible keys: all_menus or allMenus
      var allMenus = Array.isArray(d.all_menus) ? d.all_menus : (Array.isArray(d.allMenus) ? d.allMenus : []);
      // Support both possible keys: access or accessMap or access_map
      var accessMap = d.access || d.accessMap || d.access_map || {};

      // build UI
      var $container = $('#menuFeatureContainer');
      $container.empty();

      if (!allMenus.length) {
        // fallback: if menu_list.php exists, try GET it (local file)
        $.ajax({
          url: 'menu_list.php',
          method: 'GET',
          dataType: 'json',
          async: false // sync fallback (small list)
        }).done(function(mres){
          if (Array.isArray(mres) && mres.length) {
            allMenus = mres;
          }
        }).fail(function(){ /* ignore */ });
      }

      if (!allMenus.length) {
        $container.append('<div class="text-muted p-3">Belum ada daftar menu.</div>');
      } else {
        // render rows
        allMenus.forEach(function (menuKey, idx) {
          var safeMenu = escapeHtml(menuKey);
          var current = (accessMap[menuKey] || accessMap[menuKey.toLowerCase()] || 'none').toString().toLowerCase();
          if (['viewer','editor'].indexOf(current) === -1) current = 'none';

          var idNone = 'perm_none_' + idx;
          var idViewer = 'perm_viewer_' + idx;
          var idEditor = 'perm_editor_' + idx;

          var row = $('<div class="perm-row"></div>');
          var colMenu = $('<div class="menu-title"></div>').html(safeMenu);
          var colControl = $('<div class="text-center"></div>');
          // hidden menu key
          colControl.append('<input type="hidden" name="menu_keys[]" value="'+safeMenu+'">');

          var btnGroup = $('<div class="btn-group" role="group" aria-label="Akses '+safeMenu+'"></div>');

          btnGroup.append('<input type="radio" class="btn-check" name="perm_values['+idx+']" id="'+idNone+'" value="none" '+(current==='none'?'checked':'')+'>');
          btnGroup.append('<label class="btn btn-outline-secondary" for="'+idNone+'">None</label>');

          btnGroup.append('<input type="radio" class="btn-check" name="perm_values['+idx+']" id="'+idViewer+'" value="viewer" '+(current==='viewer'?'checked':'')+'>');
          btnGroup.append('<label class="btn btn-outline-info" for="'+idViewer+'">Viewer</label>');

          btnGroup.append('<input type="radio" class="btn-check" name="perm_values['+idx+']" id="'+idEditor+'" value="editor" '+(current==='editor'?'checked':'')+'>');
          btnGroup.append('<label class="btn btn-outline-primary" for="'+idEditor+'">Editor</label>');

          colControl.append(btnGroup);
          row.append(colMenu).append(colControl);
          $container.append(row);
        });
      }

      showModal();
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      var message = 'Gagal menghubungi server.';
      // Jika server merespon HTML (error), tampilkan isi response
      if (jqXHR.responseText) {
        // coba parse JSON message, kalau bisa ambil message
        try {
          var json = JSON.parse(jqXHR.responseText);
          message = json.message || jqXHR.status + ' ' + (json.error || textStatus);
        } catch (e) {
          // tampilkan potongan responseText (trim)
          var snippet = jqXHR.responseText.replace(/(<([^>]+)>)/gi, ""); // hapus tag HTML
          snippet = snippet.substring(0, 300);
          message = 'Server error: ' + (snippet || (jqXHR.status + ' ' + textStatus));
        }
      } else if (textStatus) {
        message = textStatus + (errorThrown ? ' - ' + errorThrown : '');
      }
      showError('Request Failed', message);
    });
  });

  // -------------------------
  // Submit form update
  // -------------------------
  $('#formEditUser').on('submit', function (e) {
    e.preventDefault();

    var id = $('#edit_id').val();
    if (!id) {
      showError('Error', 'ID user tidak ditemukan.');
      return;
    }

    $.ajax({
      url: 'update_user.php',
      method: 'POST',
      data: $(this).serialize(),
      dataType: 'json',
      timeout: 10000
    })
    .done(function (res) {
      if (!res) {
        showError('Error', 'Response tidak valid dari server.');
        return;
      }
      if (res.status === 'success') {
        if (window.Swal) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Akses diperbarui', timer: 1400, showConfirmButton: false });
        }
        hideModal();

        // update UI (ubah kolom Menu Access & Feature)
        var perms = collectPermsFromForm('#formEditUser');
        var formatted = formatPermsForCell(perms);
        var $row = $("button.btn-edit[data-id='" + id + "']").closest('tr');
        if ($row && $row.length) {
          $row.find('td').eq(3).html(formatted);
        } else {
          // fallback: reload datatable if server-side
          if (table && table.ajax) table.ajax.reload(null, false);
        }
      } else {
        showError('Gagal', res.message || 'Gagal menyimpan perubahan');
      }
    })
    .fail(function (jqXHR, textStatus, errorThrown) {
      var message = 'Terjadi kesalahan saat menyimpan.';
      if (jqXHR.responseText) {
        try {
          var json = JSON.parse(jqXHR.responseText);
          message = json.message || (jqXHR.status + ' ' + textStatus);
        } catch (e) {
          message = jqXHR.status + ' ' + textStatus;
        }
      }
      showError('Simpan Gagal', message);
    });
  });

  // -------------------------
  // Utilities: collect form perms
  // -------------------------
  function collectPermsFromForm(formSelector) {
    var map = {};
    $(formSelector + ' input[name="menu_keys[]"]').each(function (i) {
      var menu = $(this).val();
      var selected = $(formSelector + ' input[name="perm_values[' + i + ']"]:checked').val() || 'none';
      map[menu] = selected;
    });
    return map;
  }

  function formatPermsForCell(perms) {
    var lines = [];
    var idx = 1;
    Object.keys(perms).sort().forEach(function (k) {
      var v = perms[k];
      if (v && v !== 'none') {
        lines.push(idx + ". " + escapeHtml(k) + " = " + (v.charAt(0).toUpperCase() + v.slice(1)));
        idx++;
      }
    });
    return lines.length ? lines.join('<br>') : '<em>Belum Memiliki Akses Apapun</em>';
  }
});
