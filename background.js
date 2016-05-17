var alerts = 0;
var alerts_old = 0;
var messages = 0;
var messages_old = 0;
var friends = 0;
var friends_old = 0;

var my_notids_alerts = [];
var my_notids_messages = [];
var my_notids_friends = [];

function checkEverything() {
    $.ajax({
        url: 'https://m.facebook.com/',
        success: function(data) {
            data = data.replace(/\"\/\//g, "\"https://");
            checkNotifications(data);
        }
    });
}

function makeNotification(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon64.png",
        title: title,
        message: message
    }, function(notificationid) {
        if (title.startsWith("New M")) {
            my_notids_messages.push(notificationid);
        } else if (title.startsWith("New F")) {
            my_notids_friends.push(notificationid);
        } else {
            my_notids_alerts.push(notificationid);
        }
    });
}

chrome.notifications.onClosed.addListener(function(notificationid, byuser) {
    if (my_notids_alerts.indexOf(notificationid) > -1) {
        my_notids_alerts.pop(notificationid);
    } else if (my_notids_messages.indexOf(notificationid) > -1) {
        my_notids_messages.pop(notificationid);
    } else if (my_notids_friends.indexOf(notificationid) > -1) {
        my_notids_friends.pop(notificationid);
    }
});

chrome.notifications.onClicked.addListener(function(notificationid) {
    if (my_notids_alerts.indexOf(notificationid) > -1) {
        my_notids_alerts.pop(notificationid);
        chrome.notifications.clear(notificationid);
        window.open("https://www.facebook.com/notifications");
    } else if (my_notids_messages.indexOf(notificationid) > -1) {
        my_notids_messages.pop(notificationid);
        chrome.notifications.clear(notificationid);
        window.open("https://www.facebook.com/messages/");
    } else if (my_notids_friends.indexOf(notificationid) > -1) {
        my_notids_friends.pop(notificationid);
        chrome.notifications.clear(notificationid);
        window.open("https://www.facebook.com/friends/requests/");
    }
});

function checkNotifications(data) {
    alerts_old = alerts;
    messages_old = messages;
    friends_old = friends;

    alerts = parseInt($(data).find("#notifications_jewel a ._59tf ._59tg").text());
    messages = parseInt($(data).find("#messages_jewel a ._59tf ._59tg").text());
    friends = parseInt($(data).find("#requests_jewel a ._59tf ._59tg").text());

    chrome.storage.local.set({
        'alerts': alerts
    });
    chrome.storage.local.set({
        'messages': messages
    });
    chrome.storage.local.set({
        'friends': friends
    });

    var total = alerts + messages + friends;

    chrome.browserAction.setBadgeText({
        text: (total == 0) ? "" : total.toString()
    });

    if (total > 0) {
        if (alerts > alerts_old) {
            makeNotification("New Notification" + (alerts - alerts_old > 1 ? "s" : ""), "You've got " + alerts + " new notifications!");
            alerts_old = alerts
        }

        if (messages > messages_old) {
            makeNotification("New Message" + (messages - messages_old > 1 ? "s" : ""), "You've got " + messages + " unread messages!");
            messages_old = messages;
        }

        if (friends > friends_old) {
            makeNotification("New Friend Request" + (friends - friends_old > 1 ? "s" : ""), "You've got " + friends + " unanswered friend requests!");
            friends_old = friends;
        }
    }
}

setInterval(checkEverything, 15 * 1000);
setTimeout(checkEverything, 1000); // Don't ask...
chrome.browserAction.setBadgeBackgroundColor({"color":"#DA2929"}) // Set to red colour
