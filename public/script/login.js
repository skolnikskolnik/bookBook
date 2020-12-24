// Zo's script file - sound fx ;)

$(document).ready(function () {





    $("#entry").on("click", function (event) {
        event.preventDefault();

        let user = {
            email: $(".email").val(),
            password: $(".secret").val()
        }


        $.ajax("/login", {
            type: "POST",
            data: user
        }).then(function (data) {
            window.location.replace("/home")

        })



    })






})




// Mouse click sound effect

