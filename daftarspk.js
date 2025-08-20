
                        
$(document).ready(function () {
    // Inisialisasi DataTables
    $('#myTable').DataTable();
    $('#dataTable').DataTable();
    $('#dataTableHover').DataTable();

    // === Modal Handling ===
    var modal = document.getElementById("myModal");
    var closeModalButton = document.querySelector(".close");

    // Tombol info
    document.querySelectorAll(".infoButton").forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            var spk = this.getAttribute("data-spk");

            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        try {
                            var data = JSON.parse(xhr.responseText);
                            showDetails(data.barang, data.barangOut);
                        } catch (e) {
                            console.error("JSON parse error:", e);
                            alert("Data dari server tidak valid.");
                        }
                    } else {
                        alert("Gagal mengambil data dari server.");
                    }
                }
            };

            xhr.open("GET", "marketing/get_spkk.php?spk=" + encodeURIComponent(spk), true);
            xhr.send();
        });
    });

    // Tutup modal dengan tombol close
    if (closeModalButton) {
        closeModalButton.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    // Tutup modal jika klik area di luar modal
    document.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Fungsi untuk menampilkan detail barang
    function showDetails(barang, barangOut) {
        var barangTableBody = document.getElementById("barangTableBody");
        var barangOutBody = document.getElementById("barangOutBody");

        barangTableBody.innerHTML = "";
        barangOutBody.innerHTML = "";

        barang.forEach(function (item) {
            var row = document.createElement("tr");
            row.innerHTML =
                "<td>" + item.namabarang + "</td>" +
                "<td>" + item.qty + "</td>" +
                "<td>" + item.satuan + "</td>";
            barangTableBody.appendChild(row);
        });

        if (barangOut.length > 0) {
            barangOut.forEach(function (item) {
                var row = document.createElement("tr");
                row.innerHTML =
                    "<td>" + item.tgl_out + "</td>" +
                    "<td>" + item.namabarang + "</td>" +
                    "<td>" + item.stock_out + "</td>" +
                    "<td>" + item.satuan + "</td>";
                barangOutBody.appendChild(row);
            });
        } else {
            var row = document.createElement("tr");
            row.innerHTML =
                "<td colspan='4'><b style='color: red;'>Barang Belum di Proses Warehouse</b></td>";
            barangOutBody.appendChild(row);
        }

        if (barang.length > 0) {
            document.getElementById("spkDisplay").textContent = barang[0].spk || "";
            document.getElementById("ocDisplay").textContent = barang[0].oc || "";
            document.getElementById("pocustDisplay").textContent = barang[0].pocust || "";
            document.getElementById("namacustomerDisplay").textContent = barang[0].namacustomer || "";
            document.getElementById("notespkDisplay").textContent = barang[0].notespk || "";
        }

        modal.style.display = "block";
    }

    // === Edit Button Handling ===
    $(document).on("click", ".editButton", function () {
        var spk = $(this).data("spk");
        $("#spk").val(spk);

        // Ambil nomor urut terakhir dari server
        $.ajax({
            url: "marketing/get_nomorurut_terakhir.php",
            method: "GET",
            dataType: "json",
            success: function (response) {
                if (response.hasOwnProperty("nomorTerakhir")) {
                    var nomorTerakhir = response.nomorTerakhir;

                    // Ambil data namabarang sesuai SPK
                    $.ajax({
                        url: "marketing/get_suratjalan.php",
                        method: "POST",
                        data: { spk: spk },
                        dataType: "json",
                        success: function (data) {
                            if (data.hasOwnProperty("namabarang")) {
                                var namabarang = data.namabarang.toLowerCase();

                                // Format suratjalan
                                var suratjalan = (nomorTerakhir + 1) + "/WGS/PLP-";

                                if (namabarang.includes("concrete mixer wm")) {
                                    suratjalan += "Mixer";
                                } else if (namabarang.includes("tangki")) {
                                    suratjalan += "Hiblow";
                                } else if (namabarang.includes("batching plant")) {
                                    suratjalan += "B.Plant";
                                } else {
                                    suratjalan += "Sparepart";
                                }

                                suratjalan += "/" + new Date().getFullYear();
                                $("#suratjalan").val(suratjalan);
                            } else {
                                alert("Data namabarang tidak ditemukan.");
                            }
                        },
                        error: function (xhr) {
                            console.error(xhr.responseText);
                            alert("Terjadi kesalahan saat mengambil data SPK.");
                        }
                    });
                } else {
                    alert("Gagal mendapatkan nomor urut terakhir.");
                }
            },
            error: function (xhr) {
                console.error(xhr.responseText);
                alert("Terjadi kesalahan saat mengambil nomor urut terakhir.");
            }
        });
    });
});
