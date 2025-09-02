$(document).ready(function () {
    // Daftar semua menu_key
    const allModules = [
        "acccolocal","accoc","accpoimport","accpolocal","accquotation","accspimport","accspk",
        "accsplocal","acctt","bplant","buatfakturpajak","buatoc","buatpenawaran","buatspk","buattt",
        "chassisdata","chassistype","co","component","customer","daftarspk","hiblow","masterbank",
        "masterdivisi","masteritems","masterunits","mixer","p.bplant","p.hiblow","p.mixer","p.sparepart",
        "paymenthistory","pembayaranco","pembayaranimport","pembayarantt","po","poimport",
        "purchaseplanning","salesinvoice","salesorder","sparepart","spimport","splocal","stocksummary",
        "suplierimport","suplierlocal","suratjalanlocal","usermanagement"
    ];


$(document).ready(function () {

    // Render modul ke tabel
    function renderModules(menuList, existingAccess = {}) {
        let html = "";

        menuList.forEach(menuKey => {
            const isChecked = existingAccess[menuKey] ? "checked" : "";
            const feature = existingAccess[menuKey] || "viewers"; // default

            html += `
                <tr>
                    <td>
                        <input type="checkbox" class="menu-check" data-menu="${menuKey}" ${isChecked}>
                        <label class="ms-1">${menuKey}</label>
                    </td>
                    <td>
                        <select class="form-select feature-select" data-menu="${menuKey}" ${isChecked ? "" : "disabled"}>
                            <option value="viewers" ${feature === "viewers" ? "selected" : ""}>Viewers</option>
                            <option value="editor" ${feature === "editor" ? "selected" : ""}>Editor</option>
                        </select>
                    </td>
                </tr>
            `;
        });

        $("#menuFeatureContainer").html(`
            <table class="table table-sm align-middle mb-0">
                <tbody>${html}</tbody>
            </table>
        `);
    }

    // Event: aktifkan/disable select feature jika checkbox dicentang
    $(document).on("change", ".menu-check", function () {
        const menuKey = $(this).data("menu");
        const select = $(`.feature-select[data-menu="${menuKey}"]`);
        select.prop("disabled", !$(this).is(":checked"));
    });

    // Buka modal edit user
    $(document).on("click", ".btn-edit-user", function () {
        const userId = $(this).data("id");

        // Ambil detail user
        $.ajax({
            url: "get_user_detail.php",
            type: "GET",
            data: { id: userId },
            dataType: "json",
            success: function (res) {
                if (res.status !== "success") {
                    Swal.fire("Error", res.message, "error");
                    return;
                }

                // Set data user ke form
                $("#edit_id").val(res.data.id);
                $("#edit_nama").val(res.data.nama);

                const accessData = res.data.akses || {};

                // Ambil daftar menu dari menu_list.php
                $.ajax({
                    url: "menu_list.php",
                    type: "GET",
                    dataType: "json",
                    success: function (menuList) {
                        renderModules(menuList, accessData);
                        $("#modalEdit").modal("show");
                    },
                    error: function () {
                        Swal.fire("Error", "Gagal mengambil daftar menu", "error");
                    }
                });
            },
            error: function () {
                Swal.fire("Error", "Gagal mengambil data user", "error");
            }
        });
    });

    // Submit edit user
    $("#formEditUser").on("submit", function (e) {
        e.preventDefault();

        let access = {};
        $(".menu-check:checked").each(function () {
            const menuKey = $(this).data("menu");
            const feature = $(`.feature-select[data-menu="${menuKey}"]`).val();
            access[menuKey] = feature;
        });

        $.ajax({
            url: "update_user.php",
            type: "POST",
            data: {
                id: $("#edit_id").val(),
                access: JSON.stringify(access)
            },
            success: function (res) {
                Swal.fire("Success", "User berhasil diperbarui", "success").then(() => {
                    location.reload();
                });
            },
            error: function () {
                Swal.fire("Error", "Gagal menyimpan data", "error");
            }
        });
    });

});
