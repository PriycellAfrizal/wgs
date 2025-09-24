$(document).ready(function () {
    // Initialize DataTables
    $('#myTable').DataTable(); 
    $('#dataTable').DataTable(); 
    $('#dataTableHover').DataTable(); 

    // Initialize Select2 for 'type' field
    $('#type').select2({
        width: '470px',
        placeholder: 'Search Type Chassis .....',
        minimumInputLength: 0,
        ajax: {
            url: 'produksi/get_type.php',
            dataType: 'json',
            delay: 250,
            data: function (params) {
                return {
                    type: params.term, 
                    page: params.page
                };
            },
            processResults: function (data) {
                return {
                    results: data
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        }
    });

    // Initialize Select2 for 'spk' field
    $('#spk').select2({
        width: '100%', 
        placeholder: 'Search OR Input SPK .....',
        minimumInputLength: 0,
        tags: true,
        ajax: {
            url: 'produksi/get_spkchassis.php',
            dataType: 'json',
            delay: 250,
            processResults: function (data) {
                return {
                    results: data.map(function (item) {
                        return {
                            id: item.id,
                            text: item.text
                        };
                    })
                };
            },
            cache: true
        },
        escapeMarkup: function (markup) {
            return markup;
        }
    });

    // Handle SPK change event to get and display customer name
    $('#spk').on('change', function () {
        var selected_spk = $(this).val();
        if (!selected_spk) {
            $('#namacustomer').val(''); 
            return;
        }

        $.ajax({
            url: 'produksi/get_customerchassis.php',
            method: 'POST',
            dataType: 'json',
            data: { spk: selected_spk },
            success: function (response) {
                if (response.error) {
                    console.error('Error:', response.error);
                    $('#namacustomer').val(''); 
                } else {
                    $('#namacustomer').val(response.namacustomer || '');
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', error);
                $('#namacustomer').val(''); 
            }
        });
    });

  $(document).on('click', '.btn-edit', function () {
    var id = $(this).data('id');
    $.ajax({
        url: 'produksi/get_chassis_data.php',
        type: 'POST',
        data: { id: id },
        dataType: 'json',
        success: function (response) {
            if (response.error) {
                console.error('Error:', response.error);
                alert('Failed to fetch data. Please try again later.');
                return;
            }

            // Populate the form fields
            $("#id").val(response.id);
            $("#tgl_in").val(response.tgl_in);
            $("#namacustomer").val(response.namacustomer || '');
            $("#nomorrangka").val(response.nomorrangka);
            $("#nomormesin").val(response.nomormesin);

            // Populate Select2
            $('#spk').empty().append(new Option(response.spk, response.spk, true, true)).trigger('change.select2');
            $('#type').empty().append(new Option(response.type, response.type, true, true)).trigger('change.select2');

            // Show modal
            $('#exampleModalLong').modal('show');
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error:', error);
            alert('Failed to fetch data. Please try again later.');
        }
    });
});


    // Define the function simpanChasis
    window.simpanChasis = function () {
        var tgl_in = $('#tgl_in').val();
        var id = $('#id').val();
        var spk = $('#spk').val();
        var namacustomer = $('#namacustomer').val();
        var type = $('#type').val();
        var nomorrangka = $('#nomorrangka').val();
        var nomormesin = $('#nomormesin').val();

        // Validate fields
        if (tgl_in === '' || id === '' || spk === '' || namacustomer === '' || type === '' || nomorrangka === '' || nomormesin === '') {
            Swal.fire({
                icon: 'warning',
                title: 'Oops...',
                text: 'Harap lengkapi semua field sebelum menyimpan data.'
            });
            return;
        }

        // Send data to the server
        $.ajax({
            url: 'produksi/simpanchassis.php',
            method: 'POST',
            data: {
                tgl_in: tgl_in,
                id: id,
                spk: spk,
                namacustomer: namacustomer,
                type: type,
                nomorrangka: nomorrangka,
                nomormesin: nomormesin
            },
            dataType: 'json',
            success: function (response) {
                try {
                    if (response.error) {
                        console.error('Error:', response.error);
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Error: ' + response.error
                        });
                    } else {
                        Swal.fire({
                            icon: 'success',
                            title: 'Success',
                            text: 'Data berhasil disimpan.',
                            timer: 1000,
                            timerProgressBar: true,
                            willClose: () => {
                                location.reload(); // Reload the page after 1 second
                            }
                        });
                    }
                } catch (e) {
                    console.error('Error parsing JSON:', e);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Received unexpected response from the server.'
                    });
                }
            },
            error: function (xhr, status, error) {
                console.error('AJAX Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Terjadi kesalahan. Silakan coba lagi.'
                });
            }
        });
    };

    // Bind save button to the simpanChasis function
    $('#btnSimpanMaster').on('click', simpanChasis);
});
