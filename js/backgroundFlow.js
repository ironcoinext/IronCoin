/*global
reportGA
*/

//Grab resource lists from hosted repo
const resourceDomain = 'https://raw.githubusercontent.com/ironcoinext/IronCoin/master/phishing-domains.json';
const resourceUrl = 'https://raw.githubusercontent.com/ironcoinext/IronCoin/master/phishing-urls.json';
// TODO: should change this to the main ironcoin repo when appropriate
const affiliatesJsonUrl = 'https://raw.githubusercontent.com/mayeaux/IronCoin/master/affiliates.json';
const browser = getBrowser();
const updateTimeOfLocalStorage = 300000;
const tabs = {};
let allDomains = [];
let allUrls = [];
let localStorageTimer;
let ignoreRiskPressed = false;
let currentTabURL;

//Initiate OneSignal for security alerts and news
OneSignal.init({appId: "c020f853-50e9-4401-8ffe-a73b6a5eb390",
                googleProjectNumber: "547490674695"});

//Update our domains
function updateDomainsAndUrlsLists() {
    const domainsPromise = isFeedUpdated('domain');
    domainsPromise.then((isUpdated) => {
        if (isUpdated) {
            getUpdateInfo('domain');
        }
    });

    const urlsPromise = isFeedUpdated('url');
    urlsPromise.then((isUpdated) => {
        if (isUpdated) {
            getUpdateInfo('url');
        }
    });
    setDomainUpdate();
}

function setDomainUpdate() {
    const lastUpdate = new Date();
    localStorage.setItem('iron_lastUpdate', lastUpdate.toUTCString());
}

function isFeedUpdated(reqInfo) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', reqInfo === 'domain' ? resourceDomain : resourceUrl, true);
        xhr.send();
        xhr.timeout = 4000;
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 0) {
                const localData = reqInfo === 'domain' ? localStorage.getItem('iron_blacklist_domains') : localStorage.getItem('iron_blacklist_urls');
                //In case localStorage is empty (at the first time) or the feed was updated return true.
                (!localData || (localData && new Date(JSON.parse(localData)['lastModified']) < new Date(xhr.getResponseHeader('Last-Modified')))) ? resolve(true) : resolve(false);
            }
        };
        xhr.ontimeout = () => {
            reject(false);
        };
    });
}

function getUpdateInfo(reqInfo) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', reqInfo === 'domain' ? resourceDomain : resourceUrl, true);
    xhr.send();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 0) {
            updateLocalStorage(xhr, reqInfo);
        }
    };
    return true;
}

function updateLocalStorage(xhr, reqInfo) {
    const arrBlackListedUrls = JSON.parse(xhr.responseText);
    const blacklistAndLastModified = {};
    blacklistAndLastModified.lastModified = xhr.getResponseHeader('Last-Modified');
    if (reqInfo === 'domain') {
        blacklistAndLastModified.domains = arrBlackListedUrls;
        localStorage.setItem('iron_blacklist_domains', JSON.stringify(blacklistAndLastModified));
        allDomains = blacklistAndLastModified.domains;
    } else {
        blacklistAndLastModified.urls = arrBlackListedUrls;
        localStorage.setItem('iron_blacklist_urls', JSON.stringify(blacklistAndLastModified));
        allUrls = blacklistAndLastModified.urls;
    }
}

function getDomainFromFullURL(url_string) {
    const url = new URL(url_string);
    return url.hostname;
}

// Let user add a domain to a whitelist

function addDomainToWhiteList(whiteList, currentDomain) {
    if (ignoreRiskPressed) {
        whiteList.add(currentDomain);
    }
}

function isDomain() {
    const currentDomain = getDomainFromFullURL(currentTabURL);
    allDomains = JSON.parse(localStorage.getItem('iron_blacklist_domains')).domains;
    return allDomains.some(function (domain) {

        if(currentDomain === domain){
          console.log('Domain has cleanly matched this blocked domain: ' + domain)
        }
        if(currentDomain.endsWith('.' + domain)){
          console.log('Domain is a subdomain of this blocked domain: ' + domain)
        }
        return currentDomain === domain || currentDomain.endsWith('.' + domain);
    });
}

function isUrl() {
    allUrls = JSON.parse(localStorage.getItem('iron_blacklist_urls')).urls;
    return allUrls.some(function (domain) {
        return currentTabURL.startsWith(domain);
    });
}

function updateTabDetails(requestDetails) {
    const tabId = requestDetails.tabId;
    tabs[tabId] = {
        curTab: requestDetails.url,
        whitelist: tabs[tabId] ? tabs[tabId].whitelist : new Set(),
        prevTab: tabs[tabId] ? tabs[tabId].curTab : ''
    };
    currentTabURL = tabs[tabId].curTab;
}

function isMaliciousTabUnderRisk(tabId) {
    const currentDomain = getDomainFromFullURL(currentTabURL);
    const tabWhiteList = tabs[tabId].whitelist;
    return tabWhiteList.has(currentDomain);
}

function continueToSite(tabId) {
    const currentDomain = getDomainFromFullURL(currentTabURL);
    addDomainToWhiteList(tabs[tabId].whitelist, currentDomain);
    ignoreRiskPressed = false;
    browser.browserAction.setIcon({
        path: '../icons/icon_green.png'
    });
}

// receive message from frontend with host and converted value
var lastTab;
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {

  if(request.host !== request.puny){

    var url;
    if(lastTab){
      url = lastTab
    } else {
      url = browser.extension.getURL('../html/warning.html');
    }

    chrome.tabs.update(sender.tab.id, {url: url});


  }

  sendResponse({});
});

/** BLOCKING NAVIGATION SECTION **/
browser.webRequest.onBeforeRequest.addListener(
    (requestDetails) => {
        if (requestDetails.tabId >= 0) {


          updateTabDetails(requestDetails);
          const tabId = requestDetails.tabId;

          lastTab = browser.extension.getURL('../html/warning.html') + '?url=' + currentTabURL +
            '&ref=' + tabs[tabId].prevTab;

          // Validation if the path is in the whitelist of the tab
          if (isMaliciousTabUnderRisk(tabId)) {
            return;
          }
          if ((isDomain() || isUrl()) && !ignoreRiskPressed) {
            if(isDomain()){
              console.log('The URL has matched a blocked domain')
            }
            if(isUrl()){
              console.log('The URL has matched a blocked url');
            }

            const tabDomain = tabs[tabId].prevTab;
            const lastUrl = browser.extension.getURL('../html/warning.html') + '?url=' + currentTabURL +
              '&ref=' + tabDomain;

            lastTab = lastUrl;

            reportGA('refererUrl', 'getInToPhishingSite', tabDomain);
            reportGA('blockedUrl', 'getInToPhishingSite', currentTabURL);

            return {
              redirectUrl: lastUrl
            };
          }
          else {
            continueToSite(tabId);
            return {cancel: false};
          }
        }

    }, {
        urls: ['<all_urls>'], types: ['main_frame']
    }, ['blocking', 'requestBody']);

browser.runtime.onMessage.addListener((request) => {
    if (request.ignoreRiskButton === true) {
        ignoreRiskPressed = true;
    }
});

function getBrowser() {
    return window.msBrowser || window.browser || window.chrome;
}

//Change Icon based on events
function changeIcon() {
    browser.tabs.query({active: true}, function (tab) {
        const whiteList = tabs[tab[0].id] ? tabs[tab[0].id].whitelist : new Set();
        const tabHost = new URL(tab[0].url).host;
        currentTabURL = tabHost;
        if (whiteList.has(tabHost)) {
            browser.browserAction.setIcon({path: '../icons/icon_red.png'});
        } else {
            browser.browserAction.setIcon({path: '../icons/icon_green.png'});
        }
    });
}

browser.tabs.onCreated.addListener(function () {
    changeIcon();
});

//listen for close tab and delete all his assets
browser.tabs.onRemoved.addListener(function (tabId) {
    delete tabs[tabId];
});

//listen for new tab to be activated
browser.tabs.onActivated.addListener(function () {
    changeIcon();
});

//listen for current tab to be changed
browser.tabs.onUpdated.addListener(function () {
    changeIcon();
});


(function () {
    localStorageTimer = window.setInterval(updateDomainsAndUrlsLists, updateTimeOfLocalStorage);
    updateDomainsAndUrlsLists();
})();

window.onbeforeunload = function () {
    window.clearTimeout(localStorageTimer);
    return null;
};

let affiliatesData;
let domains = [];

function getaffiliatesJSON(){
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE && xhr.status !== 0) {

        affiliatesData = JSON.parse(xhr.responseText);

        for(const domain of affiliatesData){
          domains.push(domain.url);
        }
      }
    };

    xhr.open('GET', affiliatesJsonUrl, true);
    xhr.send(null);
    xhr.timeout = 4000;

    xhr.ontimeout = () => {
      reject(false);
    };
  });
}

getaffiliatesJSON();
setInterval(getaffiliatesJSON, 1000 * 60 * 5);

// initiate localStorage if it doesn't exist
if(localStorage.getItem('refTimes') == null){
  localStorage.setItem('reftimes', '{}');
} else {
 console.log(JSON.parse(localStorage.getItem('refTimes')))
}


const msPerDay = 1000 * 60 * 60 * 24;

function needToAttachRefQueryVar(domain){
  let storedObject = JSON.parse(localStorage.getItem('reftimes'));

  console.log(storedObject);

  // current time as utc timestamp
  const currentTime = (new Date()).getTime();

  // if that domain has nothing for ref saved item time, redirect with ref and
  if(!storedObject[domain]){


    storedObject[domain] =  currentTime;
    localStorage.setItem('reftimes', JSON.stringify(storedObject));
    return true
  }

  // if there is a match (ie existing date already) check if its over 24h old
  if(storedObject[domain]){

    const savedDate = storedObject[domain];

    const differenceInMs = currentTime - savedDate;

    // larger than 24h difference, reattach
    if(differenceInMs > msPerDay){
      storedObject[domain] = currentTime;
      localStorage.setItem('reftimes', JSON.stringify(storedObject));
      return true
    } else {
      // nothing else to do, return false (ie no need to attach ref, its still within 24h)
      return false
    }
  }

}

/** REDIRECTION SECTION **/


browser.webRequest.onBeforeRequest.addListener(
  (requestDetails) => {

      let requestedUrl = requestDetails.url;

      // get rid of https or http , and www if it exists
      requestedUrl = requestedUrl.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");

      // remove query params
      requestedUrl = requestedUrl.split("?")[0];

      // remove if last character is trailing slash
      var lastChar = requestedUrl.slice(-1);
      if (lastChar == '/') {
        requestedUrl = requestedUrl.slice(0, -1);
      }

      // loop through the domains
      for(const domain of domains){
        // check the first x amount of characters from requested url and see if it matches domain
        const newTrimmedUrl = requestedUrl.substr(0, domain.length);

        // if the domain matches redirect
        if(newTrimmedUrl == domain){

          // check if ref query should be attached
          const shouldAttachRefQuery = needToAttachRefQueryVar(domain);

          if(shouldAttachRefQuery){
            console.log('ATTACH QUERY');

            const alreadyContainsQuestionMark = requestDetails.url.indexOf('?') > -1;

            let stringToAttach;
            for(const site of affiliatesData){
              if(site.url == domain){

                const queryVarValues = site.queryVarValues;

                if(alreadyContainsQuestionMark){
                  stringToAttach = `&${queryVarValues}`
                } else {
                  stringToAttach = `?${queryVarValues}`
                }
              }
            }

            const requestedUrlWithQuery = requestDetails.url + stringToAttach;
            return { redirectUrl : requestedUrlWithQuery }
          } else {
            console.log('DONT ATTACH QUERY');
            return { redirectUrl : requestDetails.url }
          }

        };
      }




  }, {
    urls: ['<all_urls>'], types: ['main_frame']
  }, ['blocking', 'requestBody']);


