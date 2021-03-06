/*global
trackButtonClick
*/
$('document').ready(function () {

    var ref = (new URL(window.location.href)).searchParams.get('ref');

    console.log(ref);

    var goBackButton = $('#goBackButton')

    if(!ref){
      goBackButton.hide()
    }

    function getBrowser() {
        return window.msBrowser || window.browser || window.chrome;
    }

    function addLinksToText(result) {

        // get domain from url
        let domainName = new URL(result.url).origin.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");

        if(domainName.match(/[^\.]*\.[^.]*$/)){
          domainName = domainName.match(/[^\.]*\.[^.]*$/)[0];
        }

        document.getElementById('phishing_sitename').innerText = domainName;
        let ignoreButton = document.getElementById('ignore_warning_link');
        ignoreButton.href = result.url;

        // add whitelist url
        var ignoreWarningWithWhiteListAnchor = document.getElementById('ignore_warning_link_with_whitelist');
        var urlWithWhiteList = result.url += (result.url.split('?')[1] ? '&':'?') + 'addToIronCoinWhiteList=true';
        ignoreWarningWithWhiteListAnchor.href = urlWithWhiteList;




      let reportLink = document.getElementById('report_detection');
        reportLink.href = 'mailto:review@ironcoin.app?subject=Request review for ' + result.url +
            '&body=Hi,\nI found this ' + result.url + ' site was blocked due to Phishing suspicion.\n' +
            'I believe this site was wrongfully blocked, please review it again.\n';

        reportLink.addEventListener('click', function (event) {
            trackButtonClick('Buttons', 'click', event);
        });

        // update ignoreRiskPressed variable in extension, used for a whitelist
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

          addLinksToText(result);
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
