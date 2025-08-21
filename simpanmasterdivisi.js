

    function simpanmasterdivisi() {
        // Get the divisi value from the input field
        var divisiValue = $("#divisi").val();

        // Validate the divisi value (add your validation logic if needed)
        if (!divisiValue) {
            alert("Please enter a valid divisi.");
            return;
        }

        // Send an Ajax request to save the divisi
        $.ajax({
            type: "POST",
            url: "warehouse/simpanmasterdivisi.php", // Replace with your server-side script to handle divisi insertion
            data: {
                divisi: divisiValue
            },
          
success: function(response) {
    // Handle success (you can display a success message or perform other actions)
    alert("Divisi saved successfully!");
    
    // Reload the page immediately
    location.reload();

                // Optionally, you can close the modal or perform any other actions
                $('#yourModalId').modal('hide');
},






            error: function(xhr, status, error) {
                // Handle errors
                console.error("Error:", error);
                alert("Failed to save divisi. Please try again.");
            }
        });
    }


