(function($){
    $(function() {

        const HOST = 'localhost';
        const PORT = '8282';
        const URL = 'http://' + HOST + ':' + PORT + "/eventbus";
        var pubAddress = 'null';
        var subAddress = 'null';

        var eb = new EventBus(URL);

        eb.onopen = function () {
            $('#eb-log').prepend( 'Connected to ' + URL + ' EventBus.' );
        };

        var LOG = function (message){
            var currentdate = new Date();
            var datetime = "Timestamp: " + currentdate.getDate() + "/"
                + (currentdate.getMonth()+1)  + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds();
            $('#eb-log').prepend('<p><b>' + datetime + '</b><br>' + message + '</p>');
        };

        function setListener(listenerAddress) {
            eb.registerHandler(listenerAddress, function(error, message){
                LOG('Received: ' + JSON.stringify(message));
            });
        }

        function unregisterListenerHandler(listenerAddress){
            eb.unregisterHandler(listenerAddress,function() {
                LOG('Unregistered: ' + listenerAddress + ' handler.');
            });
        }

        function setPubAddress(newAddress) {
            pubAddress = newAddress;
        }

        function setSubAddress(newAddress) {
            subAddress = newAddress;
        }

        function sendMessage() {
            eb.send(address, getMessage());
        }

        function getSubAddress(){
            return $('#listen-id').val();
        }

        function getMessage(){
            return $('#message-body').val();
        }

        $('#send-id').on('change keyup paste', function(e) {
            setPubAddress(e.target.value);
        });

        $('#set-address-btn').on('click', function(){
            if(subAddress != 'null')
                unregisterListenerHandler(subAddress);
            setSubAddress(getSubAddress());
            setListener(subAddress);
        });

        $('#send-message-btn').on('click', function(){
            sendMessage();
        });

        /*
         createUbi = function () {
         $.post(URL + '/ubis', JSON.stringify(newUbi))
            .done(function (data) {
                 ubiId = data.id;
                 loadingAnimation();
                 getUbiData(ubiId);
            });
         };

         deleteUbi = function() {
             $.ajax({
                 url: URL + '/ubis/' + ubiId,
                 type: 'DELETE',
                 success: function(result) {
                    $('#ubi-info').html('<h4>Create a new UbiSOM</h4>');
                 }
             });
         }

         patchUbiSOM = function (id) {
             $.getJSON('data/'+pickedFile, function(json) {
                 $.ajax({
                     url: URL + '/ubis/' + id,
                     type: 'PATCH',
                     processData: false,
                     contentType : 'application/json',
                     dataType: 'json',
                     error: function (e) {
                         if(e.status == 202){
                             Materialize.toast('Give me more!', 2500) // 4000 is the duration of the toast
                             console.log("feed ok");
                             dataset = json;
                             console.log("dataset");
                             console.log(dataset);
                         }
                         else
                            console.log("patch error: " + e);
                     },
                     data: JSON.stringify(json)
                 });
             });
         };
         */

    }); // end of document ready
})(jQuery); // end of jQuery name space