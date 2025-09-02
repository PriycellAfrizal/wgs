// app-user-management.js (final, replace previous)
$(function () {
  // DataTable init (safe)
  var table = null;
  if ($.fn.DataTable && $('#dataTable').length) {
    try { table = $('#dataTable').DataTable(); } catch (e) { console.warn('DataTable init failed', e); }
  }

  // helpers
  function esc(s){ return (s||'').toString().replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
  function sanitizeId(s){ return 'id_' + (''+s).replace(/[^a-z0-9\-_]/gi,'_') + '_' + Math.floor(Math.random()*100000); }
  function showModal(){ var el=document.getElementById('modalEdit'); if(!el) return; if(window.bootstrap && bootstrap.Modal){ (bootstrap.Modal.getInstance(el)||new bootstrap.Modal(el)).show(); } else $('#modalEdit').modal('show'); }
  function hideModal(){ var el=document.getElementById('modalEdit'); if(!el) return; if(window.bootstrap && bootstrap.Modal){ (bootstrap.Modal.getInstance(el)||new bootstrap.Modal(el)).hide(); } else $('#modalEdit').modal('hide'); }
  function notifyError(title, msg){ if(window.Swal) Swal.fire(title||'Error', msg||'Terjadi kesalahan', 'error'); else alert((title?title+'\n':'')+(msg||'Error')); }

  // Convert features array (["info","buat"]) to role viewer/editor/none
  function featuresToRole(features){
    if(!Array.isArray(features) || features.length===0) return 'none';
    const normalized = features.map(x => (''+x).toLowerCase());
    const editorKeys = ['edit','update','create','buat','modify','add'];
    const viewerKeys = ['view','info','lihat','read'];
    if(normalized.some(r=> editorKeys.includes(r))) return 'editor';
    if(normalized.some(r=> viewerKeys.includes(r))) return 'viewer';
    // fallback heuristics
    return normalized.length > 1 ? 'editor' : (viewerKeys.includes(normalized[0])? 'viewer' : 'none');
  }

  // Normalize server detail to map menu->role
  function buildAccessMap(detail){
    var map = {};
    if(!detail) return map;

    // case: detail.data.access — direct map {menu: 'viewer'}
    if(detail.access && typeof detail.access === 'object' && !Array.isArray(detail.access)){
      Object.keys(detail.access).forEach(function(k){ 
        var v = detail.access[k];
        map[k] = (''+v).toLowerCase() === 'editor' ? 'editor' : (''+v).toLowerCase() === 'viewer' ? 'viewer' : 'none';
      });
      return map;
    }

    // case: detail.data.akses where each node may have features array
    if(detail.akses && typeof detail.akses === 'object'){
      Object.keys(detail.akses).forEach(function(k){
        var node = detail.akses[k];
        if(node && Array.isArray(node.features)) {
          map[k] = featuresToRole(node.features);
        } else if(node && node.feature) {
          map[k] = featuresToRole([node.feature]);
        } else {
          map[k] = 'none';
        }
      });
      return map;
    }

    // case: detail.data.aksesList = [{menu_key, feature}, ...]
    if(Array.isArray(detail.aksesList) || Array.isArray(detail.akses_array)){
      var arr = Array.isArray(detail.aksesList) ? detail.aksesList : detail.akses_array;
      var tmp = {};
      arr.forEach(function(item){
        if(!item.menu_key) return;
        tmp[item.menu_key] = tmp[item.menu_key] || [];
        if(item.feature) tmp[item.menu_key].push(item.feature);
      });
      Object.keys(tmp).forEach(function(k){ map[k] = featuresToRole(tmp[k]); });
      return map;
    }

    // case: detail.data.menu_keys (array) — treat as viewer
    if(Array.isArray(detail.menu_keys)){
      detail.menu_keys.forEach(function(m){ map[m] = 'viewer'; });
      return map;
    }

    // fallback: try detail.data (flat)
    if(detail.menu && detail.role){
      map[detail.menu] = detail.role;
    }

    return map;
  }

  // Render permission rows (radio) into #menuFeatureContainer
  function renderMatrix(allMenus, accessMap){
    var $container = $('#menuFeatureContainer');
    $container.empty();
    if(!Array.isArray(allMenus) || allMenus.length === 0){
      $container.append('<div class="text-muted p-3">Belum ada daftar menu.</div>');
      return;
    }

    allMenus.forEach(function(menuKey, idx){
      var role = (accessMap[menuKey] || accessMap[menuKey.toLowerCase()] || 'none').toString().toLowerCase();
      if(['viewer','editor'].indexOf(role) === -1) role = 'none';

      var idBase = sanitizeId(menuKey + '_' + idx);
      var idNone = idBase + '_none';
      var idViewer = idBase + '_viewer';
      var idEditor = idBase + '_editor';

      var $row = $('<div class="perm-row"></div>');
      var $menuCol = $('<div class="menu-title"></div>').text(menuKey);
      var $controlCol = $('<div class="text-center"></div>');
      // hidden menu key so server aligns values
      $controlCol.append('<input type="hidden" name="menu_keys[]" value="'+esc(menuKey)+'">');

      // Use bootstrap btn-check structure (works with BS5/BS4 labels)
      var $btnGroup = $('<div class="btn-group" role="group" aria-label="Akses '+esc(menuKey)+'"></div>');
      $btnGroup.append('<input type="radio" class="btn-check" name="perm_values['+idx+']" id="'+idNone+'" value="none" '+(role==='none'?'checked':'')+'>');
      $btnGroup.append('<label class="btn btn-outline-secondary" for="'+idNone+'">None</label>');
      $btnGroup.append('<input type="radio" class="btn-check" name="perm_values['+idx+']" id="'+idViewer+'" value="viewer" '+(role==='viewer'?'checked':'')+'>');
      $btnGroup.append('<label class="btn btn-outline-info" for="'+idViewer+'">Viewer</label>');
      $btnGroup.append('<input type="radio" class="btn-check" name="perm_values['+idx+']" id="'+idEditor+'" value="editor" '+(role==='editor'?'checked':'')+'>');
      $btnGroup.append('<label class="btn btn-outline-primary" for="'+idEditor+'">Editor</label>');

      $controlCol.append($btnGroup);
      $row.append($menuCol).append($controlCol);
      $container.append($row);
    });
  }

  // Click .btn-edit
  $(document).on('click', '.btn-edit', function(e){
    e.preventDefault();
    var userId = $(this).data('id');
    if(!userId){ notifyError('Error','ID user tidak ditemukan pada tombol edit.'); return; }

    // fetch both menu list and user detail in parallel
    var menuReq = $.ajax({ url: 'menu_list.php', dataType: 'json', cache: false });
    var detailReq = $.ajax({ url: 'get_user_detail.php', data: { id: userId }, dataType: 'json', cache: false });

    $.when(menuReq, detailReq).done(function(menuRes, detailRes){
      // jQuery gives arrays [data, status, jqXHR]
      var menus = Array.isArray(menuRes) ? menuRes[0] : menuRes;
      var detail = Array.isArray(detailRes) ? detailRes[0] : detailRes;

      if(!detail || detail.status !== 'success'){
        console.error('get_user_detail failed', detail);
        notifyError('Gagal', (detail && detail.message) ? detail.message : 'Gagal memuat data user');
        return;
      }

      // determine allMenus: prefer server-provided (all_menus/allMenus), else menu_list.php
      var allMenus = [];
      if(detail.data && Array.isArray(detail.data.all_menus)) allMenus = detail.data.all_menus;
      else if(detail.data && Array.isArray(detail.data.allMenus)) allMenus = detail.data.allMenus;
      else if(Array.isArray(menus)) allMenus = menus;
      else {
        // try keys of akses object
        if(detail.data && typeof detail.data.akses === 'object') allMenus = Object.keys(detail.data.akses);
      }

      // build accessMap
      var accessMap = buildAccessMap(detail.data || detail);

      // fill form fields
      $('#edit_id').val(detail.data.id || detail.id || '');
      $('#edit_nama').val(detail.data.nama || detail.nama || '');

      // finally render matrix
      renderMatrix(allMenus, accessMap);

      console.log('Rendered permission matrix', { allMenus: allMenus, accessMap: accessMap });
      showModal();

    }).fail(function(jq, textStatus, errThrown){
      console.error('Ajax fail', jq, textStatus, errThrown);
      var msg = 'Gagal menghubungi server.';
      if(jq && jq.responseText){
        try { var parsed = JSON.parse(jq.responseText); msg = parsed.message || jq.status + ' ' + textStatus; } catch(e){ msg = (jq.status? jq.status + ' ' : '') + textStatus; }
      } else if(textStatus) msg = textStatus;
      notifyError('Request Failed', msg);
    });
  });

  // Submit update
  $('#formEditUser').on('submit', function(e){
    e.preventDefault();
    var id = $('#edit_id').val();
    if(!id){ notifyError('Error','ID user tidak ditemukan.'); return; }

    $.ajax({
      url: 'update_user.php',
      method: 'POST',
      data: $(this).serialize(),
      dataType: 'json'
    }).done(function(res){
      if(!res || res.status !== 'success'){ notifyError('Gagal', (res && res.message) ? res.message : 'Gagal menyimpan perubahan'); return; }
      if(window.Swal) Swal.fire({ icon:'success', title:'Berhasil', text:'Akses diperbarui', timer:1200, showConfirmButton:false });
      hideModal();
      // update UI cell or reload table
      try {
        var perms = {}; $('#formEditUser input[name="menu_keys[]"]').each(function(i){ perms[$(this).val()] = $('#formEditUser input[name="perm_values['+i+']"]:checked').val() || 'none'; });
        var formatted = Object.keys(perms).sort().map(function(k,i){ return perms[k] !== 'none' ? (i+1)+'. '+k+' = '+(perms[k].charAt(0).toUpperCase()+perms[k].slice(1)) : null; }).filter(Boolean).join('<br>');
        var $row = $("button.btn-edit[data-id='"+id+"']").closest('tr'); if($row.length) $row.find('td').eq(3).html(formatted || '<em>Belum Memiliki Akses Apapun</em>');
        else if(table && table.ajax) table.ajax.reload(null,false);
      } catch(e){ if(table && table.ajax) table.ajax.reload(null,false); }
    }).fail(function(jq, textStatus){
      console.error('update_user fail', jq, textStatus);
      var msg = 'Terjadi kesalahan saat menyimpan.';
      if(jq && jq.responseText){
        try{ msg = JSON.parse(jq.responseText).message || msg; } catch(e){ msg = jq.status + ' ' + textStatus; }
      }
      notifyError('Simpan Gagal', msg);
    });
  });

});
