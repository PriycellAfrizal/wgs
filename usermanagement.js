$(document).ready(function () {

    // Render modul + fitur ke tabel
    function renderModules(menuList, existingAccess = {}) {
        let html = "";

        menuList.forEach(menuKey => {
            const isChecked = existingAccess[menuKey] ? "checked" : "";
            const feature = existingAccess[menuKey] || "viewers"; // default

            html += `
                <tr>
                    <td style="width:50%">
                        <input type="checkbox" class="form-check-input menu-check" data-menu="${menuKey}" ${isChecked}>
                        <label class="ms-1 text-capitalize">${menuKey}</label>
                    </td>
                    <td style="width:50%">
                        <select class="form-select form-select-sm feature-select" data-menu="${menuKey}" ${isChecked ? "" : "disabled"}>
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

    // Event: aktifkan/disable select sesuai checkbox
    $(document).on("change", ".menu-check", function () {
        const menuKey = $(this).data("menu");
        const select = $(`.feature-select[data-menu="${menuKey}"]`);
        select.prop("disabled", !$(this).is(":checked"));
    });

    // Klik tombol Edit User
    $(document).on("click", ".btn-edit", function () {
        const userId = $(this).data("id");

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

                // Isi data user
                $("#edit_id").val(res.data.id);
                $("#editNama").val(res.data.nama); // hanya untuk ditampilkan
                $("#nama").val($("#nama").val());   // nama login tetap dari hidden input

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

    // Submit form Edit
    $("#formEditUser").on("submit", function (e) {
        e.preventDefault();

        let akses = {};
        $(".menu-check:checked").each(function () {
            const menuKey = $(this).data("menu");
            const feature = $(`.feature-select[data-menu="${menuKey}"]`).val();
            akses[menuKey] = feature;
        });

        $.ajax({
            url: "update_user.php",
            type: "POST",
            data: {
                id: $("#editId").val(),
                nama: $("#nama").val(),   // ← nama dari hidden input (echo PHP)
                akses: akses              // ← kirim sebagai object, bukan string JSON
            },
            dataType: "json",
            success: function (res) {
                if (res.status === "success") {
                    Swal.fire("Success", "User berhasil diperbarui", "success")
                        .then(() => location.reload());
                } else {
                    Swal.fire("Error", res.message, "error");
                }
            },
            error: function () {
                Swal.fire("Error", "Gagal menyimpan data", "error");
            }
        });
    });

});
