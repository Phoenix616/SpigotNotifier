var id = 'SpigotNotifier';

$(document).ready(function() {
    chrome.storage.local.get('alerts', function(response) {
        $("#alerts").text(response.alerts);
    });

    chrome.storage.local.get('messages', function(response) {
        $("#messages").text(response.messages);
    });

    chrome.storage.local.get('friends', function(response) {
        $("#friends").text(response.friends);
    });

    $('body').on('click', 'a', function() {
        chrome.tabs.create({
            url: $(this).attr('href')
        });
        return false;
    });

    $('body').on('click', 'area', function() {
        chrome.tabs.create({
            url: $(this).attr('href')
        });
        return false;
    });

});
