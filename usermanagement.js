// app-user-management.js (fixed & consolidated)
$(function () {
  // init DataTable if present
  var table = null;
  if ($.fn.DataTable && $('#dataTable').length) {
    try { table = $('#dataTable').DataTable(); } catch (e) { console.warn('DataTable init failed', e); }
  }

  // helpers
  function esc(s) { return (s||'').toString().replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]); }); }
  function uid() { return 'u' + Math.floor(Math.random()*1000000); }
  function swError(title, msg) { if (window.Swal) Swal.fire(title||'Error', msg||'Terjadi kesalahan', 'error'); else alert((title?title+'\n':'')+(msg||'Error')); }
  function swSuccess(title, msg) { if (window.Swal) Swal.fire(title||'Berhasil', msg||'', 'success'); else alert((title?title+'\n':'')+(msg||'')); }

  // render matrix into #menuFeatureContainer
  function renderMatrix(allMenus, accessMap) {
    var $c = $('#menuFeatureContainer');
    $c.empty();

    if (!Array.isArray(allMenus) || allMenus.length === 0) {
      $c.append('<div class="text-muted p-3">Belum ada daftar menu.</div>');
      return;
    }

    allMenus.forEach(function(menuKey, idx){
      // normalize
      var role = (accessMap && (accessMap[menuKey] || accessMap[menuKey.toLowerCase()])) || 'none';
      role = (''+role).toLowerCase();
      if (['viewer','editor'].indexOf(role) === -1) role = 'none';

      var safeKey = esc(menuKey);
      var unique = uid();

      var $row = $('<div class="perm-row"></div>');
      var $menuCol = $('<div class="menu-title"></div>').html(safeKey);
      var $controlCol = $('<div class="text-center"></div>');

      // checkbox to enable/disable menu
      var cbId = 'cb_'+unique;
      var $cb = $('<div class="form-check d-inline-block mr-2"></div>');
      $cb.append('<input type="checkbox" class="form-check-input menu-enable" id="'+cbId+'" data-menu="'+safeKey+'" '+(role!=='none' ? 'checked' : '')+'>');
      $cb.append('<label class="form-check-label" for="'+cbId+'">Aktif</label>');

      // radios viewer/editor
      var rViewerId = 'rv_'+unique;
      var rEditorId = 're_'+unique;
      var $radios = $(
        '<div class="btn-group btn-group-sm" role="group" aria-label="akses">'
        + '<input type="radio" class="btn-check" name="feature_'+unique+'" id="'+rViewerId+'" value="viewer" '+(role==='viewer'?'checked':'')+'>'
        + '<label class="btn btn-outline-info btn-sm" for="'+rViewerId+'">Viewer</label>'
        + '<input type="radio" class="btn-check" name="feature_'+unique+'" id="'+rEditorId+'" value="editor" '+(role==='editor'?'checked':'')+'>'
        + '<label class="btn btn-outline-primary btn-sm" for="'+rEditorId+'">Editor</label>'
        + '</div>'
      );

      // hidden inputs for submission alignment (we will serialise manually but keeping hidden helps fallback)
      $controlCol.append('<input type="hidden" name="menu_keys[]" value="'+safeKey+'">');

      // assemble
      $controlCol.prepend($radios);
      $controlCol.prepend($cb);

      // disable radios if not enabled
      if (role === 'none') {
        $radios.find('input').prop('disabled', true);
      }

      $row.append($menuCol).append($controlCol);
      $c.append($row);
    });
  }

  // build access map from get_user_detail response (supports multiple shapes)
  function buildAccessMap(detail) {
    var map = {};
    if (!detail) return map;

    // if server returns direct access map
    if (detail.access && typeof detail.access === 'object' && !Array.isArray(detail.access)) {
      Object.keys(detail.access).forEach(function(k){ map[k] = detail.access[k]; });
      return map;
    }

    // if server returns akses object with features array per menu
    if (detail.akses && typeof detail.akses === 'object') {
      Object.keys(detail.akses).forEach(function(k){
        var node = detail.akses[k];
        if (node && Array.isArray(node.features) && node.features.length) {
          // if a feature string is 'viewer' or 'editor', use it; otherwise heuristics
          var f = node.features.map(function(x){ return (''+x).toLowerCase(); });
          if (f.indexOf('editor') !== -1) map[k] = 'editor';
          else if (f.indexOf('viewer') !== -1) map[k] = 'viewer';
          else if (f.some(x=> /create|edit|update|buat|add|modify/.test(x))) map[k] = 'editor';
          else if (f.some(x=> /view|info|lihat|read/.test(x))) map[k] = 'viewer';
          else map[k] = 'none';
        } else if (node && node.feature) {
          var v = (''+node.feature).toLowerCase();
          if (v === 'editor' || /create|edit|update|buat|add|modify/.test(v)) map[k] = 'editor';
          else if (v === 'viewer' || /view|info|lihat|read/.test(v)) map[k] = 'viewer';
          else map[k] = 'none';
        } else {
          map[k] = 'none';
        }
      });
      return map;
    }

    // if server returns an array of menu_keys
    if (Array.isArray(detail.menu_keys) && detail.menu_keys.length) {
      detail.menu_keys.forEach(function(m){ map[m] = 'viewer'; });
      return map;
    }

    // else empty
    return map;
  }

  // --- Click edit: load menu list + user detail then render ---
  $(document).on('click', '.btn-edit', function (ev) {
    ev.preventDefault();
    var userId = $(this).data('id');
    if (!userId) { swError('Error', 'ID user tidak ditemukan.'); return; }

    // clear UI
    $('#edit_id').val('');
    $('#edit_nama').val('');
    $('#menuFeatureContainer').empty();

    // fetch both
    var menuReq = $.ajax({ url: 'menu_list.php', dataType: 'json', cache: false });
    var detailReq = $.ajax({ url: 'get_user_detail.php', data: { id: userId }, dataType: 'json', cache: false });

    $.when(menuReq, detailReq).done(function(menuRes, detailRes){
      var menus = Array.isArray(menuRes) ? menuRes[0] : menuRes;
      var detail = Array.isArray(detailRes) ? detailRes[0] : detailRes;

      if (!detail || detail.status !== 'success') {
        var msg = (detail && detail.message) ? detail.message : 'Gagal memuat data user';
        swError('Gagal', msg);
        console.error('get_user_detail response:', detail);
        return;
      }

      // normalize menus list
      var allMenus = [];
      if (detail.data && Array.isArray(detail.data.all_menus)) allMenus = detail.data.all_menus;
      else if (detail.data && Array.isArray(detail.data.allMenus)) allMenus = detail.data.allMenus;
      else if (Array.isArray(menus) && menus.length) allMenus = menus;
      else if (detail.data && detail.data.akses && typeof detail.data.akses === 'object') allMenus = Object.keys(detail.data.akses);
      else allMenus = [];

      var accessMap = buildAccessMap(detail.data || detail);

      // fill basic fields (modal uses #edit_id & #edit_nama)
      $('#edit_id').val(detail.data && (detail.data.id || detail.id) ? (detail.data.id || detail.id) : userId);
      $('#edit_nama').val(detail.data && (detail.data.nama || detail.nama) ? (detail.data.nama || detail.nama) : '');

      // render
      renderMatrix(allMenus, accessMap);

      // show modal
      if (window.bootstrap && bootstrap.Modal) {
        showModal();
      } else {
        $('#modalEdit').modal('show');
      }

    }).fail(function(jq, txt, err){
      console.error('Ajax fail', jq, txt, err);
      var message = 'Gagal menghubungi server.';
      if (jq && jq.responseText) {
        try { var j = JSON.parse(jq.responseText); message = j.message || message; } catch(e){ message = jq.status + ' ' + txt; }
      }
      swError('Request Failed', message);
    });
  });

  // Enable/disable radios when checkbox toggle
  $(document).on('change', '.menu-enable', function () {
    var $self = $(this);
    var $btnGroup = $self.closest('.perm-row').find('.btn-group');
    if ($self.is(':checked')) {
      $btnGroup.find('input').prop('disabled', false);
      // if none selected, default select Viewer
      if (!$btnGroup.find('input:checked').length) {
        $btnGroup.find('input[value="viewer"]').prop('checked', true);
      }
    } else {
      $btnGroup.find('input').prop('checked', false).prop('disabled', true);
    }
  });

  // Submit form -> build akses object and POST
  $('#formEditUser').on('submit', function (e) {
    e.preventDefault();
    var id = $('#edit_id').val();
    if (!id) { swError('Error','ID user tidak ditemukan.'); return; }

    // build akses mapping
    var akses = {};
    $('#menuFeatureContainer .perm-row').each(function () {
      var menu = $(this).find('.menu-title').text();
      var enabled = $(this).find('.menu-enable').is(':checked');
      if (!enabled) return;
      var role = $(this).find('.btn-group input:checked').val() || 'viewer';
      akses[menu] = { menu_key: menu, features: [role] };
    });

    // send
    $.ajax({
      url: 'update_user.php',
      method: 'POST',
      data: { id: id, akses: JSON.stringify(akses) },
      dataType: 'json'
    }).done(function(res){
      if (!res) { swError('Error','Response server kosong'); return; }
      if (res.status === 'success') {
        swSuccess('Berhasil', res.message || 'Akses diperbarui');
        // update table cell easily if present
        try {
          var formatted = Object.keys(akses).sort().map(function(k,i){ return (i+1)+'. '+k+' = '+ (akses[k].features[0].charAt(0).toUpperCase()+akses[k].features[0].slice(1)); }).join('<br>');
          var $row = $("button.btn-edit[data-id='"+id+"']").closest('tr');
          if ($row.length) $row.find('td').eq(3).html(formatted || '<em>Belum Memiliki Akses Apapun</em>');
        } catch(e){ if (table && table.ajax) table.ajax.reload(null, false); }
        // hide modal
        hideModal();
      } else {
        swError('Gagal', res.message || 'Gagal menyimpan perubahan');
      }
    }).fail(function(jq, txt){
      console.error('update fail', jq, txt);
      var msg = 'Terjadi kesalahan saat menyimpan.';
      if (jq && jq.responseText) {
        try { msg = JSON.parse(jq.responseText).message || msg; } catch(e){ msg = jq.status + ' ' + txt; }
      }
      swError('Simpan Gagal', msg);
    });
  });

}); 
