# IronCoin
IronCoin is a crypto security extension which detects phishing, puny code attacks, and hijacking attempts. It helps to prevent scams and malicious attacks by validating the authenticity of sites and flagging sites with malicious practices. It also provides news alerts related to crypto security events.

# Download:
[![Download for Chrome](https://i.imgur.com/s4jieZv.png)](https://test.com)
[![Download for Brave](https://i.imgur.com/ccYajgx.jpg)](https://test.com)


# Current Stats:
Currently IronCoin blocks **56,497** malicious top level domains and **267** malicious phishing pages hosted on other sites.

# How Does It Work:
IronCoin sits in your web browser as an extension, it loads Javascript to detect the links you are navigating to and check them against a database of known bad links. It also runs basic checks to see if the link is using malicious puny code.

We'll also send real time alerts of major security news in the cryptocurrency space, such as exchange hacking or 0-day exploits.

# What We Block Right Now:

1. Phishing Domains
2. Puny Code Domains.
3. Sites attempting reflexive XSS attacks on cryptosites.
4. Sites that can be used to execute malicious code.
5. Sites that attempt to exploit unlocked wallets.
6. Crypto scams.
7. Crypto related malware.
8. Pump and Dump scams.
9. Fake crypto exchanges.
10. Fake crypto software (such as fake 'official' wallets).
11. Wallet generates that are known to have weak randomness.
12. News/Viral link spam sites.
13. Crypto MLM scams.
14. Crypto referral scams.

# Planned Updates:
* Implement Gitcoin to reward contributions.
* Add support to block crypto mining.
* Add support to validate SSL check.
* Add support for anti-phishing images.
* Add support for wallet safelist.
* Add support to detect and block clipboard hijacking and manipulation.
* Add ML for detecting new scam sites based on common behavior.

# Who Created IronCoin?
[Redditor AdamSC1](https://old.reddit.com/user/AdamSC1/) who is a moderator of Reddit's [/r/cryptocurrency](http://old.reddit.com/r/cryptocurrency) and [/r/EthTrader](http://old.reddit.com/r/ethtrader). These subreddits have had more than 10M+ unique monthly visitors at their peak, and are often innundated with crypto scams. While the teams use manual moderation and tools like Reddit's AutoMod to keep scams at bay, Adam wanted to find a way to extend user protection across the web.

# What Permissions Does IronCoin's Extension Need?

1. IronCoin requests access to webRequest, webRequestBlocking, <all_urls>, tabs and active tabs in order to scan the links you are visiting in your browser and detect phishing sites or punycode links.
2. We provide permission to google-analytics.com to record interaction events with our app, to better understand how users are using the app.
3. We request access to the 'storage' permission in order to store a local whitelist on your computer, this way no information needs to go back to the cloud.
4. We request the 'gcm' 'notifications' and 'identity' APIs for Chrome Extensions in order to power our notification messaging system which is run in Firebase and OneSignal. This allows users to get real time notifications.
5. We request the 'certificateProvider' API, although it is not yet in use. This will be used to check the validity of certificates in future releases.

# Is IronCoin Monetized?
Yes.

IronCoin is free and open source. But, our commercial release on Chrome's extension store does include affiliate monetization. For a very limited number of sites, where we detect the user is going to the authentic site, we'll direct the link through an affilate redirect system which adds a referral code to the link. The user will then be directed to the site.

This redirect is handled by [SprigAds](https://www.sprigads.com) a privacy focused affiliate network that does not store user information on redirect.

In the future, we may also consider monetizing a limited number of news alerts, so long as they are limited, and high-quality.

The proceeds of monetization will go directly to funding further development of this project.

If users wish to not have any monetization in the exchange, they can download and install the source code correctly. But, that version of the extension will run without live time alerts, or future updates.


# Privacy

IronCoin respects your privacy.

We currently run the OneSignal SDK, and a Google Analytics event SDK, both of those products are bound by the respective privacy policies of those companies.

Beyond that, IronCoin does not transmit any data back to their own servers, or record information about users.

# How Can I Add/Remove Sites From The List?

If you've discovered a site that should be added or removed from our list, please open up an issue on GitHub for us to review.

# Licensing and Attribution:

IronCoin contains open source code from SegaSec and WarpDesign. Those components are released under ISC and MIT licenses respectively by those parties.

Portions of our list have been provided by BlurpSec of MyCrypto, Etherscam Database, by Mitchellkrogza's Phishing Database, and the moderation teams at /r/cryptocurrency and /r/ethtrader.

# Disclaimer:

The views, code and goals within this project are those of individual contributors and should not be considered to be a reflection of the views of their employers. No work herein is endorsed by the employer of any individual and all contributions have been done independently.
