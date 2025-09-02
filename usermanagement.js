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

  
$(document).ready(function () {
  // --- Buka Modal Edit User ---
  $(document).on("click", ".btn-edit", function () {
    const userId = $(this).data("id");

    // Reset form
    $("#formEditUser")[0].reset();
    $("#aksesContainer").empty();

    // Ambil data user
    $.ajax({
      url: "get_user_detail.php",
      type: "GET",
      data: { id: userId },
      dataType: "json",
      success: function (res) {
        if (res.status === "success") {
          const data = res.data;
          $("#editUserId").val(data.id);
          $("#editNama").val(data.nama);

          // Render menu akses
          renderMenuAkses(data.akses);
          $("#modalEdit").modal("show");
        } else {
          Swal.fire("Error", res.message || "Gagal mengambil data", "error");
        }
      },
      error: function () {
        Swal.fire("Error", "Terjadi kesalahan server", "error");
      }
    });
  });

  // --- Render Menu Akses (Menu + Feature) ---
  function renderMenuAkses(akses) {
    const container = $("#aksesContainer");

    Object.keys(akses).forEach((key) => {
      const menu = akses[key];
      const features = menu.features || [];

      // Checkbox menu
      const menuCheckbox = `
        <div class="form-check mb-2">
          <input type="checkbox" 
                 class="form-check-input menu-checkbox" 
                 id="menu_${menu.menu_key}" 
                 data-menu="${menu.menu_key}" 
                 ${features.length > 0 ? "checked" : ""}>
          <label class="form-check-label fw-bold" for="menu_${menu.menu_key}">
            ${menu.menu_key}
          </label>
        </div>
      `;

      // Radio fitur (viewer/editor)
      const featureOptions = `
        <div class="ms-4 mb-3 feature-options" data-parent="${menu.menu_key}" 
             style="display: ${features.length > 0 ? "block" : "none"}">
          <div class="form-check">
            <input type="radio" 
                   class="form-check-input" 
                   name="feature_${menu.menu_key}" 
                   value="viewer" 
                   ${features.includes("viewer") ? "checked" : ""}>
            <label class="form-check-label">Viewer</label>
          </div>
          <div class="form-check">
            <input type="radio" 
                   class="form-check-input" 
                   name="feature_${menu.menu_key}" 
                   value="editor" 
                   ${features.includes("editor") ? "checked" : ""}>
            <label class="form-check-label">Editor</label>
          </div>
        </div>
      `;

      container.append(menuCheckbox + featureOptions);
    });
  }

  // --- Toggle feature saat centang menu ---
  $(document).on("change", ".menu-checkbox", function () {
    const menuKey = $(this).data("menu");
    const featureBox = $(`.feature-options[data-parent="${menuKey}"]`);
    if ($(this).is(":checked")) {
      featureBox.show();
    } else {
      featureBox.hide();
      featureBox.find("input[type=radio]").prop("checked", false);
    }
  });

  // --- Submit Form Edit User ---
  $("#formEditUser").on("submit", function (e) {
    e.preventDefault();

    // Ambil data akses yang dipilih
    const akses = {};
    $(".menu-checkbox").each(function () {
      const menuKey = $(this).data("menu");
      if ($(this).is(":checked")) {
        const feature = $(
          `input[name="feature_${menuKey}"]:checked`
        ).val();
        akses[menuKey] = {
          menu_key: menuKey,
          features: feature ? [feature] : []
        };
      }
    });

    // Kirim data ke server
    $.ajax({
      url: "update_user.php",
      type: "POST",
      data: {
        id: $("#editUserId").val(),
        nama: $("#editNama").val(),
        akses: JSON.stringify(akses)
      },
      success: function (res) {
        try {
          const json = JSON.parse(res);
          if (json.status === "success") {
            Swal.fire("Berhasil", "Data user berhasil diperbarui", "success")
              .then(() => location.reload());
          } else {
            Swal.fire("Error", json.message || "Gagal update data", "error");
          }
        } catch (e) {
          Swal.fire("Error", "Respon server tidak valid", "error");
        }
      },
      error: function () {
        Swal.fire("Error", "Terjadi kesalahan server", "error");
      }
    });
  });
});
