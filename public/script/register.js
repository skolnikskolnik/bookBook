// Team's script file
$(document).ready(function () {

    $("#bookBtn").on("click", function (event) {
        event.preventDefault();
        let user = {
            first_name: $(".firstName").val(),
            last_name: $(".lastName").val(),
            email: $(".email").val(),
            password: $(".secret").val()
        }

        $.ajax("/login", {
            type: "GET"
        }).then(function () {
            console.log("going to login")
            window.location.replace("/login")

            $.ajax("/", {
                type: "POST",
                data: user,
                dataType: "json"

            }).then(function () {
                window.location.replace("/home")
            })

        })

    })



})

// Zo's script file sound fx ;) sign up button
function play() {
    var sound = document.getElementById("mouse-click");
    sound.play();
}
