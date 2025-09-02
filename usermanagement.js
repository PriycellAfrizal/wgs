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

    // Render modul ke dalam tabel
    function renderModules(existingAccess = {}) {
        let html = "";
        allModules.forEach(menuKey => {
            const isChecked = existingAccess[menuKey] ? "checked" : "";
            const feature = existingAccess[menuKey] ? existingAccess[menuKey] : "viewers"; // default viewers

            html += `
                <tr>
                    <td>
                        <input type="checkbox" class="menu-check" data-menu="${menuKey}" ${isChecked}>
                        <label>${menuKey}</label>
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
        $("#moduleTable tbody").html(html);
    }

    // Event: aktifkan/disable select feature jika checkbox dicentang
    $(document).on("change", ".menu-check", function () {
        const menuKey = $(this).data("menu");
        const select = $(`.feature-select[data-menu="${menuKey}"]`);
        if ($(this).is(":checked")) {
            select.prop("disabled", false);
        } else {
            select.prop("disabled", true);
        }
    });

    // Ambil data akses user saat buka modal edit
    $(document).on("click", ".btn-edit-user", function () {
        const userId = $(this).data("id");
        $.ajax({
            url: "get_user_detail.php",
            type: "GET",
            data: { id: userId },
            dataType: "json",
            success: function (res) {
                if (res.status === "success") {
                    // render modul dengan data existing
                    const accessData = res.data.menu_access || {};
                    renderModules(accessData);
                    $("#modalEdit").modal("show");
                } else {
                    Swal.fire("Error", res.message, "error");
                }
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
                id: $("#editUserId").val(),
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
