const _AnalyticsCodeIron = 'UA-143374133-1';

function trackButtonClick(eventCategory, eventAction, eventLabel) {
    reportGA(eventCategory, eventAction, eventLabel.target.id);
}

window.trackButtonClick = trackButtonClick;

function reportGA(eventCategory, eventAction, eventLabel) {
    try {
        const request = new XMLHttpRequest();
        const url = 'https://www.google-analytics.com/collect';
        let params = 'v=1';
        params += '&tid=' + _AnalyticsCodeIron;
        params += '&t=event';
        params += '&ea=' + eventAction;
        params += '&ec=' + eventCategory;
        params += '&el=' + eventLabel;
        params += '&cid=0';

        request.open('POST', url, true);
        request.send(params);
    } catch (e) {
        this._log('Error sending report to Google Analytics.\n' + e);
    }
}