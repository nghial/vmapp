$(document).ready(function() {
    // this handler also triggers when user clicks Enter in an input field
        $("#gamesButton").click(function() {
                $(".group :input").each(function() {

                        if($(this).val() >= 0 && $(this).val() <= 1337 && $(this).val().length > 0){
                                return;
                        }
     
                        alert("You have entered incorrect values in one or more of the input fields. The values must be ranging from 0 to 1337");

                        if(navigator.appName == "Microsoft Internet Explorer"){
                                event.returnValue = false;
                                return false;
                        }
                        else{
                                event.preventDefault();
                                return false;
                        }
                });
        });
});
