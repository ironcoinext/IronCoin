/*global
trackButtonClick
*/
$('document').ready(function () {
    function getBrowser() {
        return window.msBrowser || window.browser || window.chrome;
    }

    function addLinksToText(result) {
        document.getElementById('phishing_sitename').innerText = result.url;
        let ignoreButton = document.getElementById('ignore_warning_link');
        ignoreButton.href = result.url;

        let reportLink = document.getElementById('report_detection');
        reportLink.href = 'mailto:review@ironcoin.app?subject=Request review for ' + result.url +
            '&body=Hi,\nI found this ' + result.url + ' site was blocked due to Phishing suspicion.\n' +
            'I believe this site was wrongfully blocked, please review it again.\n';

        reportLink.addEventListener('click', function (event) {
            trackButtonClick('Buttons', 'click', event);
        });

        ignoreButton.addEventListener('click', function (event) {
            browser.runtime.sendMessage({ignoreRiskButton: true}, () => {
            });
            trackButtonClick('Buttons', 'click', event);
        });
    }

    function setListenersToButtons(result) {
        if (document.getElementById('iron-warning')) {
            let goBackbutton = document.getElementById('goBackButton');
            goBackbutton.setAttribute('href', result.ref);
            goBackbutton.addEventListener('click', function (event) {
                trackButtonClick('Buttons', 'click', event);
            });

            let seeDetButton = document.getElementById('seeDetailsButton');

            seeDetButton.addEventListener('click', function (event) {
                let setting = document.getElementById('errorDescriptionContainer');
                setting.hidden = !setting.hidden;
                if (!setting.hidden) {
                    document.getElementById('errorLongDesc_phishing').scrollIntoView();
                    addLinksToText(result);
                }
                trackButtonClick('Buttons', 'click', event);
            });
        }
    }

    function parseQueryString(url) {
        let urlParams = {};
        url.replace(
            new RegExp('([^?=&]+)(=([^&]*))?', 'g'),
            function ($0, $1, $2, $3) {
                urlParams[$1] = $3;
            }
        );
        return urlParams;
    }

    let browser = getBrowser();
    let urlToParse = location.search;
    let result = parseQueryString(urlToParse);
    setListenersToButtons(result);
});
