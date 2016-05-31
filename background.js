var alerts = 0;
var alerts_old = 0;
var messages = 0;
var messages_old = 0;
var reports = 0;
var reports_old = 0;
var moderation = 0;
var moderation_old = 0;
var my_notids_alerts = [];
var my_notids_messages = [];

function checkEverything() {
    $.ajax({
        url: 'https://www.spigotmc.org',
        success: function(data) {
            data = data.replace(/\"\/\//g, "\"https://");
            checkNotifications(data);
            checkProfileStats(data);
            checkStaffStuff(data);
        }
    });
}

function makeNotification(title, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: "icon512.png",
        title: title,
        message: message
    }, function(notificationid) {
        if (title.startsWith("New Alert")) {
            my_notids_alerts.push(notificationid);
        } else if (title.startsWith("New Message")) {
            my_notids_messages.push(notificationid);
        } else if (title.startsWith("New Report")) {
            my_notids_reports.push(notificationid);
        } else if (title.startsWith("New Moderation")) {
            my_notids_moderation.push(notificationid);
        }
    });
}

chrome.notifications.onClosed.addListener(function(notificationid, byuser) {
    if (my_notids_alerts.indexOf(notificationid) > -1) {
        my_notids_alerts.pop(notificationid);
    } else if (my_notids_messages.indexOf(notificationid) > -1) {
        my_notids_messages.pop(notificationid);
    } else if (my_notids_reports.indexOf(notificationid) > -1) {
        my_notids_reports.pop(notificationid);
    } else if (my_notids_moderation.indexOf(notificationid) > -1) {
        my_notids_moderation.pop(notificationid);
    }
});

chrome.notifications.onClicked.addListener(function(notificationid) {
    if (my_notids_alerts.indexOf(notificationid) > -1) {
        my_notids_alerts.pop(notificationid);
        chrome.notifications.clear(notificationid);
        window.open("https://www.spigotmc.org/account/alerts");
    } else if (my_notids_messages.indexOf(notificationid) > -1) {
        my_notids_messages.pop(notificationid);
        chrome.notifications.clear(notificationid);
        window.open("https://www.spigotmc.org/conversations/");
    } else if (my_notids_reports.indexOf(notificationid) > -1) {
        my_notids_reports.pop(notificationid);
        chrome.notifications.clear(notificationid);
        window.open("https://www.spigotmc.org/reports/");
    } else if (my_notids_moderation.indexOf(notificationid) > -1) {
        my_notids_moderation.pop(notificationid);
        chrome.notifications.clear(notificationid);
        window.open("https://www.spigotmc.org/moderation-queue/");
    }
});

function checkNotifications(data) {
    alerts_old = alerts;
    messages_old = messages;

    alerts = parseInt($(data).find("#AlertsMenu_Counter").text());
    messages = parseInt($(data).find("#ConversationsMenu_Counter").text());

    chrome.storage.local.set({
        'alerts': alerts
    });
    chrome.storage.local.set({
        'messages': messages
    });

    var total = alerts + messages;

    chrome.browserAction.setBadgeText({
        text: (total == 0) ? "" : total.toString()
    });

    if (total > 0) {
        if (alerts > alerts_old) {
            alerts_old = alerts
            makeNotification("New Alert" + (alerts > 1 ? "s" : ""), "You've got " + alerts + " new alert" + (alerts > 1 ? "s" : "") + "!");
        }

        if (messages > messages_old) {
            messages_old = messages;
            makeNotification("New Message" + (messages > 1 ? "s" : ""), "You've got " + messages + " unread message" + (messages > 1 ? "s" : "") + "!");
        }
    }
}

function checkProfileStats(data) {
    chrome.storage.local.set({
        'posts': $(data).find("#content").find(".stats").text().split(":")[1].replace("\n", "")
    });
    chrome.storage.local.set({
        'rating': $(data).find("#content").find(".dark_postrating_positive").text()
    });
}

function checkStaffStuff(data) {   
    reports_old = reports;
    moderation_old = moderation;
    
    var report_data = $(data).find(".reportedItems .alert .Total");
    reports = report_data.length > 0 ? parseInt(report_data.text()) : 0;
    
    var moderation_data = $(data).find(".moderationQueue .alert .Total");
    //moderation = typeof moderation_data !== 'undefined' ? parseInt(moderation_data[0].text()) : 0;
    moderation = moderation_data.length > 0  ? parseInt(moderation_data.text().substring(moderation_data.text().length / 2)) : 0;
        
    chrome.storage.local.set({
        'reports': reports
    });
    chrome.storage.local.set({
        'moderation': moderation
    });
    
    /*
    Do I really want notifications for that?
        
    var total = alerts + messages;

    if (total > 0) {
        if (reports > reports_old) {
            reports_old = reports
            makeNotification("New Report" + (reports > 1 ? "s" : ""), "You've got " + reports + " new report" + (reports > 1 ? "s" : "") + "!");
        }

        if (moderation > moderation_old) {
            moderation_old = moderation;
            makeNotification("New Moderation Entr" + (moderation > 1 ? "ies" : "y"), "You've got " + moderation + " unresolved moderation entr" + (moderation > 1 ? "ies" : "y") + "!");
        }
    }
    */

}
setInterval(checkEverything, 15 * 1000);
setTimeout(checkEverything, 1000); // Don't ask...
chrome.browserAction.setBadgeBackgroundColor({"color":"#ed8106"}) // Set to orange colour
