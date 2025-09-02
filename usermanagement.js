// app-user-management.js
$(document).ready(function () {
  // -------------------------
  // Init DataTable
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
  // Init select2
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
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]);
    });
  }

  function showModal() {
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
  // Click Edit button
  // -------------------------
  $(document).on('click', '.btn-edit', function (e) {
    e.preventDefault();
    var userId = $(this).data('id');
    if (!userId) {
      showError('Error', 'ID user tidak ditemukan pada tombol edit.');
      return;
    }

    $.ajax({
      url: 'get_user_detail.php',
      method: 'GET',
      data: { id: userId },
      dataType: 'json',
      timeout: 8000
    })
      .done(function (res) {
        if (!res || res.status !== 'success') {
          var msg = (res && res.message) ? res.message : 'Gagal memuat data user.';
          showError('Gagal memuat data', msg);
          return;
        }

        var d = res.data || {};
        $('#edit_id').val(d.id || '');
        $('#edit_nama').val(d.nama || '');

        var allMenus = Array.isArray(d.all_menus) ? d.all_menus : Object.keys(d.akses || {});
        var aksesMap = d.akses || {};

        var $container = $('#menuFeatureContainer');
        $container.empty();

        if (!allMenus.length) {
          $container.append('<div class="text-muted p-3">Belum ada daftar menu.</div>');
        } else {
          allMenus.forEach(function (menuKey, idx) {
            var safeMenu = escapeHtml(menuKey);
            var features = (aksesMap[menuKey] && aksesMap[menuKey].features) || [];

            var row = $('<div class="perm-row mb-3"></div>');
            var colMenu = $('<div class="menu-title fw-bold mb-1"></div>').html(safeMenu);
            var colControl = $('<div class="feature-checkboxes"></div>');

            colControl.append('<input type="hidden" name="menu_keys[]" value="' + safeMenu + '">');

            if (!features.length) {
              colControl.append('<span class="text-muted">Tidak ada fitur</span>');
            } else {
              features.forEach(function (f, fidx) {
                var fid = 'feat_' + idx + '_' + fidx;
                var checked = 'checked';
                var cb = '<div class="form-check form-check-inline">' +
                  '<input class="form-check-input" type="checkbox" name="features[' + safeMenu + '][]" id="' + fid + '" value="' + escapeHtml(f) + '" ' + checked + '>' +
                  '<label class="form-check-label" for="' + fid + '">' + escapeHtml(f) + '</label>' +
                  '</div>';
                colControl.append(cb);
              });
            }

            row.append(colMenu).append(colControl);
            $container.append(row);
          });
        }

        showModal();
      })
      .fail(function (jqXHR, textStatus, errorThrown) {
        var message = 'Gagal menghubungi server.';
        if (jqXHR.responseText) {
          try {
            var json = JSON.parse(jqXHR.responseText);
            message = json.message || jqXHR.status + ' ' + textStatus;
          } catch (e) {
            var snippet = jqXHR.responseText.replace(/(<([^>]+)>)/gi, "");
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

          if (table && table.ajax) table.ajax.reload(null, false);
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
});
